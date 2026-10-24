"""Maintenance-only network check: compare official stable docs with installed signatures."""

from __future__ import annotations

import argparse
from concurrent.futures import ThreadPoolExecutor
from datetime import datetime, timezone
from html.parser import HTMLParser
import inspect
import json
from pathlib import Path
import urllib.request

from refresh_api_snapshot import load_class


BASE = "https://aedt.docs.pyansys.com/version/stable/"
CHECKS = {
    "ansys.aedt.core.visualization.post.post_common_3d.PostProcessor3D": (
        "get_solution_data create_report available_report_solutions available_report_quantities "
        "export_report_to_csv export_report_to_file export_report_to_jpg "
        "create_report_from_configuration create_fieldplot_surface create_fieldplot_volume "
        "export_field_file export_field_file_on_grid export_field_jpg get_scalar_field_value"
    ).split(),
    "ansys.aedt.core.visualization.post.solution_data.SolutionData": (
        "get_expression_data export_data_to_csv plot set_active_variation"
    ).split(),
    "ansys.aedt.core.hfss.Hfss": (
        "export_touchstone export_convergence export_mesh_stats export_profile "
        "get_antenna_data release_desktop"
    ).split(),
    "ansys.aedt.core.modules.solve_setup.SetupHFSS": ["get_solution_data"],
    "ansys.aedt.core.visualization.plot.pdf.AnsysReport": ["create", "save_pdf"],
}


class SignatureParser(HTMLParser):
    def __init__(self, identifier):
        super().__init__()
        self.identifier = identifier
        self.inside = False
        self.params = []
        self.current = None

    def handle_starttag(self, tag, attrs):
        attrs = dict(attrs)
        if tag == "dt" and attrs.get("id") == self.identifier:
            self.inside = True
        if not self.inside:
            return
        if tag == "em" and "sig-param" in attrs.get("class", "").split():
            self.current = []

    def handle_data(self, data):
        if self.inside and self.current is not None:
            self.current.append(data)

    def handle_endtag(self, tag):
        if not self.inside:
            return
        if tag == "em" and self.current is not None:
            self.params.append("".join(self.current).strip())
            self.current = None
        elif tag == "dt":
            self.inside = False


def compare(item):
    class_name, method = item
    identifier = class_name + "." + method
    prefix = "API/visualization/_autosummary/" if ".visualization." in class_name else "API/_autosummary/"
    url = BASE + prefix + identifier + ".html"
    cls = load_class(class_name)
    signature = inspect.signature(getattr(cls, method))
    parameters = [p for p in signature.parameters.values() if p.name not in ("self", "cls")]
    result = {"api": cls.__name__ + "." + method, "url": url, "source_signature": str(signature)}
    try:
        request = urllib.request.Request(url, headers={"User-Agent": "PyAEDT-offline-reference/1.0"})
        with urllib.request.urlopen(request, timeout=20) as response:
            html = response.read().decode("utf-8")
        parser = SignatureParser(identifier)
        parser.feed(html)
        doc_parameters = [p for p in parser.params if p not in ("*", "/")]
        names = [p.split(":", 1)[0].split("=", 1)[0].strip().lstrip("*") for p in doc_parameters]
        expected = [p.name for p in parameters]
        result["documented_parameters"] = doc_parameters
        result["parameter_names_match"] = names == expected
        defaults_match = len(doc_parameters) == len(parameters)
        for text, parameter in zip(doc_parameters, parameters):
            actual = text.split("=", 1)[1].strip() if "=" in text else None
            expected_default = None if parameter.default is inspect.Parameter.empty else repr(parameter.default)
            if actual != expected_default:
                defaults_match = False
        result["defaults_match"] = defaults_match
        result["status"] = "match" if result["parameter_names_match"] and defaults_match else "mismatch"
    except Exception as exc:
        result.update(status="unavailable", error=f"{type(exc).__name__}: {exc}")
    return result


def main():
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument("--output-dir", type=Path, default=Path(__file__).resolve().parent)
    args = parser.parse_args()
    import ansys.aedt.core as core
    items = [(cls, method) for cls, methods in CHECKS.items() for method in methods]
    with ThreadPoolExecutor(max_workers=4) as executor:
        checks = list(executor.map(compare, items))
    report = {
        "checked_at_utc": datetime.now(timezone.utc).isoformat(),
        "pyaedt_version": core.__version__,
        "package_entry": core.__file__,
        "scope": "Parameter names, order and defaults only; return annotations and AEDT execution not checked.",
        "checks": checks,
    }
    args.output_dir.mkdir(parents=True, exist_ok=True)
    (args.output_dir / "official_doc_check.json").write_text(
        json.dumps(report, ensure_ascii=False, indent=2) + "\n", encoding="utf-8"
    )
    for result in checks:
        print(result["status"], result["api"])
    return 0 if all(result["status"] == "match" for result in checks) else 1


if __name__ == "__main__":
    raise SystemExit(main())
