"""Create an offline PyAEDT postprocessing reference without starting AEDT."""

from __future__ import annotations

import argparse
import ast
from datetime import datetime, timezone
import hashlib
import importlib
import importlib.metadata
import inspect
import json
from pathlib import Path
import re
import sys


TARGETS = {
    "ansys.aedt.core.hfss.Hfss": (
        "export_touchstone export_convergence export_mesh_stats export_profile "
        "export_results get_antenna_data release_desktop project_file design_name "
        "existing_analysis_sweeps excitation_names field_setup_names"
    ).split(),
    "ansys.aedt.core.desktop.Desktop": ["release_desktop"],
    "ansys.aedt.core.visualization.post.post_common_3d.PostProcessor3D": (
        "get_solution_data create_report available_report_solutions "
        "available_report_quantities available_quantities_categories "
        "export_report_to_csv export_report_to_file export_report_to_jpg "
        "create_report_from_configuration delete_report all_report_names "
        "available_report_types create_fieldplot_surface create_fieldplot_volume "
        "create_fieldplot_cutplane export_field_file export_field_file_on_grid "
        "export_field_jpg get_scalar_field_value"
    ).split(),
    "ansys.aedt.core.visualization.post.common.Reports": (
        "standard modal_solution terminal_solution far_field"
    ).split(),
    "ansys.aedt.core.visualization.post.solution_data.SolutionData": (
        "get_expression_data export_data_to_csv plot set_active_variation "
        "primary_sweep primary_sweep_values expressions intrinsics "
        "active_variation active_intrinsic enable_pandas_output "
        "units_sweeps units_data variations number_of_variations "
        "full_matrix_real_imag full_matrix_mag_phase"
    ).split(),
    "ansys.aedt.core.visualization.report.common.CommonReport": (
        "create get_solution_data export_config edit_x_axis_scaling "
        "edit_y_axis_scaling add_cartesian_y_marker"
    ).split(),
    "ansys.aedt.core.modules.solve_setup.SetupHFSS": ["get_solution_data"],
    "ansys.aedt.core.visualization.plot.pdf.AnsysReport": (
        "__init__ create add_chapter add_sub_chapter add_text add_image "
        "add_table add_chart save_pdf"
    ).split(),
}

LEGACY_PROBES = {
    "ansys.aedt.core.visualization.post.solution_data.SolutionData": (
        "data_real data_imag data_magnitude data_db20 data_phase"
    ).split(),
    "ansys.aedt.core.visualization.post.post_hfss.PostProcessorHFSS": ["get_antenna_data"],
}


def load_class(path):
    module, name = path.rsplit(".", 1)
    return getattr(importlib.import_module(module), name)


def source_info(obj):
    try:
        path = Path(inspect.getsourcefile(obj)).resolve()
        line = inspect.getsourcelines(obj)[1]
        parts = path.parts
        idx = next(i for i, part in enumerate(parts) if part == "ansys")
        return {
            "source": "/".join(parts[idx:]),
            "line": line,
            "source_sha256": hashlib.sha256(path.read_bytes()).hexdigest(),
        }
    except (OSError, TypeError, StopIteration):
        return {}


def instance_attribute(cls, name):
    """Recognize attributes assigned by instance methods, without instantiation."""
    for parent in cls.__mro__:
        try:
            source = inspect.getsource(parent)
            tree = ast.parse(source)
        except (OSError, TypeError, IndentationError, SyntaxError):
            continue
        for node in ast.walk(tree):
            if (
                isinstance(node, ast.Attribute)
                and isinstance(node.ctx, ast.Store)
                and isinstance(node.value, ast.Name)
                and node.value.id == "self"
                and node.attr == name
            ):
                return source_info(parent)
    return None


def collect_member(cls, name):
    key = cls.__name__ + "." + name
    try:
        obj = inspect.getattr_static(cls, name)
    except AttributeError:
        location = instance_attribute(cls, name)
        if location is not None:
            return {"name": key, "kind": "instance_attribute", **location}
        return {"name": key, "kind": "missing"}
    kind = "property" if isinstance(obj, property) else "method"
    function = obj.fget if isinstance(obj, property) else obj
    entry = {"name": key, "kind": kind, **source_info(function)}
    if kind == "method":
        entry["signature"] = str(inspect.signature(function))
    docstring = inspect.getdoc(function) or ""
    # Upstream Examples can contain obsolete arguments or require a live AEDT object.
    # Keep the parameter/return reference; use the separately validated cookbook examples.
    entry["docstring"] = re.split(r"(?:^|\n)Examples\n-+\n", docstring, maxsplit=1)[0].rstrip()
    return entry


def render(snapshot, license_text):
    lines = [
        "# PyAEDT 后处理 API 本机快照", "",
        f"- PyAEDT：`{snapshot['pyaedt_version']}`",
        f"- Python：`{snapshot['python_version']}`",
        f"- 解释器：`{snapshot['python_executable']}`",
        f"- 生成时间（UTC）：`{snapshot['generated_at_utc']}`",
        f"- PyAEDT 包入口：`{snapshot['package_entry']}`",
        "- 生成过程只导入类并读取签名/源码；未实例化 Desktop/Hfss，未连接或启动 AEDT。",
        "- 此文件保存本机安装包的接口事实，升级环境后重新生成。",
        "- 英文参数/返回说明摘自 MIT 授权源码的 docstring；不是联网网页缓存。",
        "- 为避免旧示例中的错误参数，未收录原始 Examples 段；调用示例请查 README.md。",
        "- 实际参数以 signature 为准，实现差异和数值验证请查 VALIDATION.md。", "",
        "## 接口索引", "",
        "| 名称 | 类型 |", "| --- | --- |",
    ]
    for entry in snapshot["members"]:
        lines.append(f"| `{entry['name']}` | {entry['kind']} |")
    for entry in snapshot["members"]:
        lines.extend(["", f"## {entry['name']}", "", f"类型：`{entry['kind']}`", ""])
        if "signature" in entry:
            lines.extend(["```text", entry["name"] + entry["signature"], "```", ""])
        if entry["kind"] == "instance_attribute":
            lines.extend(["这是实例属性：从对象读取，不加 `()`；静态类查询可能找不到它。", ""])
        if "source" in entry:
            lines.extend([
                f"源码：`{entry['source']}:{entry['line']}`",
                f"源码文件 SHA-256：`{entry['source_sha256']}`", "",
            ])
        if entry.get("docstring"):
            lines.extend(["````text", entry["docstring"], "````"])
    lines.extend(["", "## 旧接口与路径探测", "", "| 名称 | 当前状态 |", "| --- | --- |"])
    for entry in snapshot["legacy_probes"]:
        lines.append(f"| `{entry['name']}` | {entry['kind']} |")
    lines.extend(["", "## 上游源码许可", "", "```text", license_text.rstrip(), "```", ""])
    return "\n".join(lines)


def main():
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument("--output-dir", type=Path, default=Path(__file__).resolve().parent)
    args = parser.parse_args()
    try:
        distribution = importlib.metadata.distribution("pyaedt")
    except importlib.metadata.PackageNotFoundError:
        parser.error("Use the Python interpreter in the environment containing pyaedt.")
    package = importlib.import_module("ansys.aedt.core")
    if package.__version__ != distribution.version:
        raise RuntimeError("Imported PyAEDT and distribution metadata refer to different versions")
    previous_path = args.output_dir / "api_snapshot.json"
    if previous_path.is_file():
        previous = json.loads(previous_path.read_text(encoding="utf-8"))
        if previous["pyaedt_version"] != distribution.version:
            parser.error("Reference version differs. Select a separate --output-dir for this environment.")
    members = []
    for class_name, names in TARGETS.items():
        cls = load_class(class_name)
        members.extend(collect_member(cls, name) for name in names)
    probes = []
    for class_name, names in LEGACY_PROBES.items():
        cls = load_class(class_name)
        probes.extend(collect_member(cls, name) for name in names)
    snapshot = {
        "generated_at_utc": datetime.now(timezone.utc).isoformat(),
        "pyaedt_version": distribution.version,
        "python_version": sys.version.split()[0],
        "python_executable": sys.executable,
        "package_entry": package.__file__,
        "members": members,
        "legacy_probes": probes,
    }
    license_text = None
    for item in distribution.files or []:
        if str(item).replace("\\", "/").endswith("licenses/LICENSE"):
            license_text = Path(distribution.locate_file(item)).read_text(encoding="utf-8")
            break
    if license_text is None:
        raise RuntimeError("Upstream license was not found; no snapshot was written.")
    args.output_dir.mkdir(parents=True, exist_ok=True)
    (args.output_dir / "api_snapshot.json").write_text(
        json.dumps(snapshot, ensure_ascii=False, indent=2) + "\n", encoding="utf-8"
    )
    (args.output_dir / "api_snapshot.md").write_text(render(snapshot, license_text), encoding="utf-8")
    missing = [entry["name"] for entry in members if entry["kind"] == "missing"]
    print(f"PyAEDT {distribution.version}: {len(members)} members; {len(missing)} missing.")
    print(f"Output: {args.output_dir.resolve()}")
    if missing:
        print("Missing required members: " + ", ".join(missing), file=sys.stderr)
        return 1
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
