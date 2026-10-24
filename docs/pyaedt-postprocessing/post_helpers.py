"""Small postprocessing guards. Importing this module does not start AEDT."""

from __future__ import annotations

import csv
import inspect
from pathlib import Path

import numpy as np


def checked_call(function, /, *args, **kwargs):
    """Reject argument errors before entering PyAEDT's exception-handling wrapper."""
    inspect.signature(function).bind(*args, **kwargs)
    result = function(*args, **kwargs)
    if result is False or result is None:
        raise RuntimeError(f"{function.__qualname__} returned {result!r}")
    return result


def require_file(path):
    """Check the actual file, rather than relying on an export return value."""
    if not path:
        raise RuntimeError("Export did not provide a file path")
    output = Path(path)
    if not output.is_file() or output.stat().st_size == 0:
        raise RuntimeError(f"Export is missing or empty: {output}")
    return output


def complex_xy(data, expression):
    """Read one active variation/cut with raw real/imaginary values and native x units."""
    if expression not in data.expressions:
        raise ValueError(f"Expression not returned: {expression}; available: {data.expressions}")
    x, real = checked_call(data.get_expression_data, expression=expression, formula="real")
    x_imag, imag = checked_call(data.get_expression_data, expression=expression, formula="imag")
    x, x_imag = np.asarray(x, dtype=float), np.asarray(x_imag, dtype=float)
    real, imag = np.asarray(real, dtype=float), np.asarray(imag, dtype=float)
    if x.ndim != 1 or x.size == 0 or x.shape != real.shape or x.shape != imag.shape:
        raise ValueError("Expected nonempty one-dimensional x/real/imag arrays of equal shape")
    if not np.array_equal(x, x_imag):
        raise ValueError("Real/imaginary data have different x coordinates")
    if not all(np.all(np.isfinite(item)) for item in (x, real, imag)):
        raise ValueError("Raw data contain NaN or infinity")
    return x, real + 1j * imag


def frequency_to_hz(values, unit):
    """Convert explicitly from units_sweeps['Freq']; never guess the native unit."""
    factors = {"Hz": 1.0, "kHz": 1e3, "MHz": 1e6, "GHz": 1e9, "THz": 1e12}
    if unit not in factors:
        raise ValueError(f"Unsupported/unknown frequency unit: {unit!r}")
    return np.asarray(values, dtype=float) * factors[unit]


def write_complex_csv(data, expressions, output):
    """Export the active variation/cut explicitly, including both real and imaginary parts."""
    if isinstance(expressions, str):
        expressions = [expressions]
    if not expressions:
        raise ValueError("At least one expression is required")
    traces = [complex_xy(data, expression) for expression in expressions]
    x = traces[0][0]
    if not all(np.array_equal(x, axis) for axis, _ in traces[1:]):
        raise ValueError("Expressions have different x coordinates")
    axis_name = data.primary_sweep
    axis_unit = data.units_sweeps.get(axis_name, "")
    headers = [f"{axis_name} [{axis_unit}]"]
    for expression in expressions:
        unit = data.units_data.get(expression, "")
        suffix = f" [{unit}]" if unit else ""
        headers.extend([f"{expression} Real{suffix}", f"{expression} Imag{suffix}"])
    output = Path(output)
    output.parent.mkdir(parents=True, exist_ok=True)
    with output.open("w", newline="", encoding="utf-8-sig") as stream:
        writer = csv.writer(stream)
        writer.writerow(headers)
        for index, value in enumerate(x):
            row = [float(value)]
            for _, trace in traces:
                row.extend([float(trace[index].real), float(trace[index].imag)])
            writer.writerow(row)
    return require_file(output)
