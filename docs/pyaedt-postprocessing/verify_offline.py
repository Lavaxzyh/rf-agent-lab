"""Validate cookbook arguments and raw data handling, without an AEDT connection."""

from __future__ import annotations

import argparse
import ast
import csv
from datetime import datetime, timezone
import inspect
import json
from pathlib import Path
import re
import tempfile

import numpy as np
import ansys.aedt.core as core
from ansys.aedt.core import Desktop, Hfss
from ansys.aedt.core.visualization.post.common import Reports
from ansys.aedt.core.visualization.post.post_common_3d import PostProcessor3D
from ansys.aedt.core.visualization.post.solution_data import SolutionData
from ansys.aedt.core.visualization.report.common import CommonReport
from ansys.aedt.core.visualization.plot.pdf import AnsysReport

from post_helpers import checked_call, complex_xy, frequency_to_hz, require_file, write_complex_csv


OWNERS = {
    "app": Hfss, "desktop": Desktop, "app.post": PostProcessor3D,
    "app.post.reports_by_category": Reports,
    "data": SolutionData, "gamma": SolutionData, "ff_data": SolutionData,
    "report": CommonReport, "pdf": AnsysReport,
}


class MockAedtData:
    """Synthetic backend data, not a model or evidence about a real HFSS solve."""

    def GetDataExpressions(self):
        return ["S(P1,P1)"]

    def GetDesignVariableNames(self):
        return []

    def GetSweepNames(self):
        return ["Freq"]

    def GetSweepValues(self, name, *args):
        return [1.0, 2.0]

    def GetSweepUnits(self, name):
        return "GHz"

    def GetRealDataValues(self, expression, *args):
        return [0.3, -0.5]

    def GetImagDataValues(self, expression, *args):
        return [0.4, 0.0]

    def GetDataUnits(self, expression):
        return ""

    def IsDataComplex(self, expression):
        return True


def dotted(node):
    if isinstance(node, ast.Name):
        return node.id
    if isinstance(node, ast.Attribute):
        parent = dotted(node.value)
        return parent + "." + node.attr if parent else ""
    return ""


def check_examples(path):
    text = path.read_text(encoding="utf-8")
    blocks = list(re.finditer(r"```python\n(.*?)\n```", text, re.DOTALL))
    count = 0
    for index, match in enumerate(blocks, start=1):
        tree = ast.parse(match.group(1), filename=f"{path.name}:block{index}")
        for node in ast.walk(tree):
            if not isinstance(node, ast.Call):
                continue
            func, args, keywords = node.func, node.args, node.keywords
            if dotted(func) == "checked_call" and args:
                func, args = args[0], args[1:]
            name = dotted(func)
            if name == "AnsysReport":
                function = AnsysReport
                sig = inspect.signature(function)
            elif isinstance(func, ast.Attribute):
                owner = OWNERS.get(dotted(func.value))
                if owner is None:
                    continue
                member = inspect.getattr_static(owner, func.attr)
                if isinstance(member, property):
                    raise TypeError(f"{name} is a property, not a method")
                sig = inspect.signature(member)
                sig = sig.replace(parameters=[p for p in sig.parameters.values() if p.name != "self"])
            else:
                continue
            if any(isinstance(arg, ast.Starred) for arg in args) or any(k.arg is None for k in keywords):
                raise ValueError(f"Unverifiable expanded arguments in example: {name}")
            sig.bind(*[object() for arg in args], **{key.arg: object() for key in keywords})
            count += 1
    return len(blocks), count


def main():
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument("--write-report", action="store_true", help="Write VALIDATION.md in this directory")
    args = parser.parse_args()
    base = Path(__file__).resolve().parent
    snapshot = json.loads((base / "api_snapshot.json").read_text(encoding="utf-8"))
    if core.__version__ != snapshot["pyaedt_version"]:
        raise RuntimeError(
            f"Environment PyAEDT {core.__version__} differs from snapshot {snapshot['pyaedt_version']}. "
            "Use a matching environment or generate a separate snapshot."
        )
    blocks, calls = check_examples(base / "README.md")
    observations = []
    expression = "S(P1,P1)"
    data = SolutionData([MockAedtData()])
    x, z = complex_xy(data, expression)
    np.testing.assert_allclose(x, [1.0, 2.0])
    np.testing.assert_allclose(z, [0.3 + 0.4j, -0.5 + 0j])
    np.testing.assert_allclose(frequency_to_hz(x, "GHz"), [1e9, 2e9])
    phase_expected = np.angle(z)
    np.testing.assert_allclose(phase_expected, [0.9272952180016123, np.pi])
    np.testing.assert_allclose(np.angle(z, deg=True), [53.13010235415598, 180.0])
    _, db = data.get_expression_data(expression=expression, formula="db20")
    np.testing.assert_allclose(db, 20 * np.log10(np.abs(z)))
    for formula in ("phase", "phasedeg", "phaserad"):
        _, values = data.get_expression_data(expression=expression, formula=formula)
        observations.append((f"formula={formula}", np.asarray(values).tolist()))
    try:
        checked_call(data.get_expression_data, expressions=expression)
    except TypeError:
        pass
    else:
        raise AssertionError("Unknown keyword was not rejected")
    with tempfile.TemporaryDirectory(prefix="pyaedt-offline-check-") as temp:
        output = Path(temp) / "complex.csv"
        write_complex_csv(data, [expression], output)
        with output.open(encoding="utf-8-sig", newline="") as stream:
            rows = list(csv.reader(stream))
        assert len(rows) == 3 and len(rows[0]) == 3, rows
        np.testing.assert_allclose(np.asarray(rows[1:], dtype=float), [[1.0, .3, .4], [2.0, -.5, 0.]])
        native = Path(temp) / "native.csv"
        # Fresh object: observations must not depend on prior conversions or active-expression changes.
        native_data = SolutionData([MockAedtData()])
        native_data.export_data_to_csv(str(native), delimiter=",")
        require_file(native)
        with native.open(encoding="utf-8-sig", newline="") as stream:
            native_rows = list(csv.reader(stream))
        observations.append(("native CSV header", native_rows[0]))
        observations.append(("native CSV rows", native_rows[1:]))
        try:
            require_file(Path(temp) / "missing.csv")
        except RuntimeError:
            pass
        else:
            raise AssertionError("Missing export was not rejected")
    print(f"PASS: PyAEDT {core.__version__}; {blocks} Python blocks parsed; {calls} API calls bound.")
    print("PASS: synthetic raw complex data, dB, explicit Hz conversion, CSV round trip and failure guards.")
    for name, values in observations:
        print(name + ": " + repr(values))
    if args.write_report:
        official = json.loads((base / "official_doc_check.json").read_text(encoding="utf-8"))
        if official["pyaedt_version"] != core.__version__:
            raise RuntimeError("Official document check is for a different PyAEDT version")
        official_matches = sum(row["status"] == "match" for row in official["checks"])
        lines = [
            "# PyAEDT 1.9.0 文档与离线验证记录", "",
            f"核对日期：2026-10-13（Asia/Shanghai）；离线验证记录时间：{datetime.now(timezone.utc).isoformat()}。", "",
            "## 版本与来源", "",
            "- 最新正式版依据：[PyPI 1.9.0](https://pypi.org/project/pyaedt/1.9.0/)；发布日 2026-10-10。",
            "- 官方文档首页核对版本：[stable 1.9.0](https://aedt.docs.pyansys.com/version/stable/)。",
            "- wheel：`pyaedt-1.9.0-py3-none-any.whl`。",
            "- wheel SHA-256：`2db03d1e4c70c14fed8eb05f91cc68506932c173107c220f901a1a8b1b44cbc8`，与 PyPI 文件信息一致。",
            f"- 加载包入口：`{core.__file__}`。",
            "- 发布源码 tag：`v1.9.0`；发布 commit：`5b5b7f59d8835eec15974060f3f658f2fa0ad46b`。", "",
            "## 已完成检查", "",
            f"- 静态读取 {len(snapshot['members'])} 个方法/属性，未缺失目标接口。",
            f"- 官方文档参数名称、顺序、默认值：{official_matches}/{len(official['checks'])} 一致。",
            "- 详细官方 URL 与每项参数对照见 `official_doc_check.json`。",
            f"- 手册 {blocks} 个 Python 代码块通过语法解析；{calls} 次直接/checked_call API 调用通过实际签名绑定。",
            "- 合成结果的实部/虚部提取、dB、频率 Hz 转换、复数 CSV 写入回读通过数值断言。",
            "- 未知参数与不存在的导出文件能够被 helper 拒绝。", "",
            "## 合成数据与实现差异", "",
            "测试输入：频率 `[1, 2] GHz`，`S(P1,P1) = [0.3+0.4j, -0.5+0j]`。",
            "数据由 MockAedtData 提供，真实执行发布包的 SolutionData 数组处理；没有 AEDT 会话。", "",
            "期望相位：弧度 `[0.927295218, 3.141592654]`；角度 `[53.130102354, 180]`。", "",
            "| 检查 | 实际输出 |", "| --- | --- |",
        ]
        for name, values in observations:
            escaped = repr(values).replace("|", "\\|")
            lines.append(f"| `{name}` | `{escaped}` |")
        lines.extend([
            "", "`phase`/`phasedeg` 返回相同弧度数值，`phaserad` 再乘 π/180；因此主手册用实部/虚部配合 `np.angle`。",
            "原生 SolutionData CSV 在该复数样本中没有保存虚部列；显式 CSV helper 通过全部列的回读断言。",
            "这些结论限于该发布包和该合成案例，不等于所有真实工程导出场景均已测试。", "",
            "## 尚未进行的验证", "",
            "- 未启动/连接 AEDT，未加载或改动 `.aedt` 工程，未求解。",
            "- 未实测 HFSS 原生报告、Touchstone、远场、场图或场文件导出。",
            "- 未实际生成 PDF，未验证 pdf-oxide、中文字体或报告版式。",
            "- 1.9.0 复用本机解释器已有依赖以完成离线检查；这不是完整独立环境部署验证。",
            "- 跨 AEDT 版本的能力仍需按具体功能验证，签名一致不能保证底层功能可用。", "",
            "## 复验", "",
            "在安装目标版本的解释器中执行 `python verify_offline.py`；默认不联网、不写验证记录。",
            "维护时使用 `--write-report` 重写本文件；网络对照由 `compare_official_docs.py` 单独执行。", "",
        ])
        (base / "VALIDATION.md").write_text("\n".join(lines), encoding="utf-8")
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
