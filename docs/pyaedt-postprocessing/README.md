# PyAEDT 1.9.0 结果提取与报告生成调用手册

核对日期：**2026-10-13（Asia/Shanghai）**。适用重点：HFSS 的 S 参数、传播常数、远场、场分布、原生报告和文件导出。

截至核对日，最新正式版是 **PyAEDT 1.9.0**，2026-10-10 发布；官方 stable 文档首页同样标为 1.9.0。[PyPI 1.9.0](https://pypi.org/project/pyaedt/1.9.0/) · [官方文档首页](https://aedt.docs.pyansys.com/version/stable/) · [GitHub v1.9.0](https://github.com/ansys/pyaedt/releases/tag/v1.9.0)

本手册依据 **1.9.0 官方 wheel 的实际签名、源码和官方文档**整理。已将 27 个核心接口的参数名称、顺序、默认值逐项对照；完整记录见 [official_doc_check.json](official_doc_check.json)。69 个接口/属性的签名、英文说明和源码定位保存在 [api_snapshot.md](api_snapshot.md)，平时无需联网。

本机原有 HFSS Python 环境检测到的是 **PyAEDT 1.1.0**，本次没有升级它。1.9.0 在隔离目录中读取与测试。**接口核对与离线数据测试已完成；未连接 AEDT，也未在实际 HFSS 工程中执行导出。**具体工程的端口名、求解类型、扫频、频点、远场上下文必须由工程提供。

## 目录

1. [版本兼容性与使用规则](#1-版本兼容性与使用规则)
2. [接口速查](#2-接口速查)
3. [结果上下文与预检查](#3-结果上下文与预检查)
4. [提取 S 参数、频率与复数数据](#4-提取-s-参数频率与复数数据)
5. [CSV 与 Touchstone 导出](#5-csv-与-touchstone-导出)
6. [创建 HFSS 原生报告与导出图片](#6-创建-hfss-原生报告与导出图片)
7. [参数扫描与多维数据](#7-参数扫描与多维数据)
8. [Gamma 传播常数](#8-gamma-传播常数)
9. [远场、增益与方向图](#9-远场增益与方向图)
10. [场图、场数据与场标量](#10-场图场数据与场标量)
11. [收敛、网格与求解耗时](#11-收敛网格与求解耗时)
12. [独立图表与 PDF 报告](#12-独立图表与-pdf-报告)
13. [已发现的接口陷阱](#13-已发现的接口陷阱)
14. [提高正确调用率的工程方案](#14-提高正确调用率的工程方案)
15. [官方参考入口](#15-官方参考入口)

## 1. 版本兼容性与使用规则

### 1.1 HFSS、AEDT、PyAEDT、Python 是不同的版本

HFSS 是 AEDT 平台中的求解器。`Hfss(version="2026.1")` 选择 **AEDT 2026 R1**；PyAEDT 版本取决于当前 Python 环境安装的包。

| 层次 | 核对内容 | 正确理解 |
| --- | --- | --- |
| AEDT/HFSS | 2022.1、2024.2、2026.1 等 | 决定底层产品功能、结果格式和可用通信方式 |
| PyAEDT | 1.9.0 等 | 决定 Python 方法名、参数名与封装实现 |
| Python | 3.10–3.14 | 1.9.0 的官方支持范围；还需匹配依赖包 |
| 工程上下文 | Modal/Terminal、Setup、Sweep、variation、sphere | 决定某个结果表达式能否读取 |

官方当前声明支持 **AEDT 2022 R1 及以上**；兼容性列表对 PyAEDT ≥0.27.0 列出的测试基准为 **AEDT 2026 R1**。这不是逐版本、逐功能的全部组合验证。不能推导出“最新 PyAEDT 的所有功能在所有旧 HFSS 上可用”。[官方兼容性说明](https://pypi.org/project/pyaedt/1.9.0/)

`Hfss` 中 `machine`、`port` 所描述的 gRPC 连接要求 AEDT **2022 R2 或以上**。AEDT 2021 R1 不在当前声明支持范围内，不能仅凭方法名相同就按 1.9.0 使用。[Hfss 连接参数](https://aedt.docs.pyansys.com/version/stable/API/_autosummary/ansys.aedt.core.hfss.Hfss.html)

### 1.2 本手册的运行前提

以下示例中的 `app` 表示**已连接正确工程和设计的 Hfss 实例**。示例按用途独立执行，共用第 3 节的 `OUT`、`SOLUTION`、`CATEGORY` 等配置；代码块不应整篇串行运行。

- 读取已存在的求解结果，后处理代码不调用 `analyze()`、`analyze_setup()` 或批量求解。
- 工程必须通过绝对 `.aedt` 路径加载并核对身份。不要用尚未加载的工程名称创建 `Hfss(project="工程名")`，否则可能创建空工程。
- 原生报告和场图会改变设计中的报告/显示对象。若要保留这些对象，应在授权的工作副本中操作，核对目标路径后再保存。
- CSV、Touchstone、JPG、JSON、PDF 是导出文件，创建报告与保存 `.aedt` 是另一步。
- 显式选择 solution、variation、表达式、上下文；返回对象之外，还检查数据长度、单位、范围和文件内容。

每次运行宜使用新的输出目录。`require_file()` 只检查存在和非空；若复用旧目录，还需通过时间或哈希确认本次导出确实更新了文件。

### 1.3 离线核对当前环境

```python
from importlib.metadata import version
import inspect
from ansys.aedt.core.visualization.post.solution_data import SolutionData

print("PyAEDT:", version("pyaedt"))
print(inspect.signature(SolutionData.get_expression_data))
print(inspect.getsourcefile(SolutionData))
```

固定基准建议写入项目依赖：`pyaedt==1.9.0`。更新应先在独立虚拟环境验证，再改变工程环境。日常运行不需要查询“今天最新是多少”。

## 2. 接口速查

本表只列常用参数；**不是完整签名**。完整签名与默认值查 [api_snapshot.md](api_snapshot.md)。

| 需求 | 正确调用入口 | 关键参数/返回值 |
| --- | --- | --- |
| 可用报告类别 | `app.post.available_report_types` | 属性，不能加 `()` |
| 已有报告名 | `app.post.all_report_names` | 属性，列表 |
| 可用 solution | `app.post.available_report_solutions()` | `report_category`；返回列表 |
| 可用物理量 | `app.post.available_report_quantities()` | `report_category, solution, quantities_category, context` |
| 读取结果 | `app.post.get_solution_data()` | `expressions, setup_sweep_name, variations, primary_sweep_variable, report_category, context`；对象或 `False` |
| 读取一条数组 | `data.get_expression_data()` | `expression, formula, convert_to_SI, use_quantity, sweeps`；`(x, y)` |
| 创建原生报告 | `app.post.create_report()` | `plot_name, plot_type` 及上述上下文；报告对象或失败值 |
| 报告导出 CSV | `app.post.export_report_to_csv()` | `project_dir, plot_name`；返回文件路径 |
| 报告导出其他数据格式 | `app.post.export_report_to_file()` | `output_dir, plot_name, extension`；返回路径 |
| 报告导出图片 | `app.post.export_report_to_jpg()` | `project_path, plot_name, width, height, image_format`；布尔值 |
| 复用报告配置 | `report.export_config()` / `app.post.create_report_from_configuration()` | `output_file` / `input_file, solution_name, name` |
| Touchstone | `app.export_touchstone()` | `setup, sweep, output_file, renormalization, impedance`；路径或布尔值 |
| 表面/体场图 | `app.post.create_fieldplot_surface()` / `create_fieldplot_volume()` | `assignment, quantity, setup, intrinsics, plot_name` |
| 场点数据 | `app.post.export_field_file()` | `quantity, solution, output_file, sample_points, intrinsics`；布尔值 |
| 场网格数据 | `app.post.export_field_file_on_grid()` | `quantity, solution, file_name, grid_start/stop/step`；路径或布尔值 |
| 场最大值等 | `app.post.get_scalar_field_value()` | `quantity, scalar_function, solution, object_name, intrinsics`；数值 |
| FFD 天线数据 | `app.get_antenna_data()` | `frequencies, setup, sphere, variations`；与 `SolutionData` 不同的对象 |
| 收敛/网格/耗时 | `app.export_convergence()` / `export_mesh_stats()` / `export_profile()` | `setup, output_file`；variation 参数名见第 11 节 |
| 独立 PDF | `AnsysReport` | `create, add_chapter, add_text, add_image, add_table, save_pdf` |

## 3. 结果上下文与预检查

`setup_sweep_name` 使用完整形式 **`"Setup1 : Sweep1"`** 或 **`"Setup1 : LastAdaptive"`**。`LastAdaptive` 不等于完整扫频数据，不能用它代替频率 sweep。[官方 get_solution_data 参数](https://aedt.docs.pyansys.com/version/stable/API/visualization/_autosummary/ansys.aedt.core.visualization.post.post_common_3d.PostProcessor3D.get_solution_data.html)

```python
from pathlib import Path
from copy import deepcopy
from post_helpers import checked_call, require_file, complex_xy, frequency_to_hz, write_complex_csv

# 将本目录放在脚本旁边或 Python 搜索路径中，才能导入 post_helpers。
EXPECTED_PROJECT = Path(r"E:\YourProject\DUT.aedt").resolve()
EXPECTED_DESIGN = "HFSSDesign1"
OUT = Path(r"E:\YourProject\post_out")
SOLUTION = "Setup1 : Sweep1"   # 必须使用该工程中实际存在且有结果的条目
CATEGORY = "Modal Solution Data"  # Terminal 工程通常为 Terminal Solution Data

if Path(app.project_file).resolve() != EXPECTED_PROJECT:
    raise RuntimeError("当前工程路径不正确")
if app.design_name != EXPECTED_DESIGN:
    raise RuntimeError("当前设计不正确")

print("分析条目:", app.existing_analysis_sweeps)
print("报告类别:", app.post.available_report_types)
print("可用 solution:", app.post.available_report_solutions(report_category=CATEGORY))
print("激励名称:", app.excitation_names)

if CATEGORY not in app.post.available_report_types:
    raise RuntimeError("报告类别不适用于当前设计")
if SOLUTION not in app.post.available_report_solutions(report_category=CATEGORY):
    raise RuntimeError("指定 solution 不可用；检查名称和已保存结果")
OUT.mkdir(parents=True, exist_ok=True)

FAMILIES = deepcopy(app.available_variations.nominal_values)
FAMILIES["Freq"] = ["All"]
print(app.post.available_report_quantities(
    report_category=CATEGORY,
    solution=SOLUTION,
    quantities_category="S Parameter",
))
```

优先从枚举返回值或 HFSS 的 Results 对话框复制实际表达式。`S(1,1)`、`S(Port1,Port1)`、`S(Port1:1,Port1:1)` 只是在不同工程中可能出现的名称，不能互换。Terminal、Modal、HFSS 3D Layout 的结果类别也不能直接混用。

## 4. 提取 S 参数、频率与复数数据

### 4.1 get_solution_data：不必先创建原生报告

1.9.0 的完整常用签名（省略类型注解，保留参数名和默认值）：

```text
app.post.get_solution_data(
    expressions=None, setup_sweep_name=None, domain=None, variations=None,
    primary_sweep_variable=None, report_category=None, context=None,
    subdesign_id=None, polyline_points=1001, math_formula=None
)
data.get_expression_data(
    expression=None, formula="real", convert_to_SI=False,
    use_quantity=False, sweeps=None
)
```

`get_solution_data` 接受多个表达式，`get_expression_data` 中是单数 `expression`，并返回 **x 与 y 两个数组**。[官方数组提取接口](https://aedt.docs.pyansys.com/version/stable/API/visualization/_autosummary/ansys.aedt.core.visualization.post.solution_data.SolutionData.get_expression_data.html)

```python
EXPRESSIONS = ["S(Port1,Port1)", "S(Port2,Port1)"]  # 替换为实际表达式
data = checked_call(
    app.post.get_solution_data,
    expressions=EXPRESSIONS,
    setup_sweep_name=SOLUTION,
    domain="Sweep",
    variations=FAMILIES,
    primary_sweep_variable="Freq",
    report_category=CATEGORY,
)
print("返回表达式:", data.expressions)
print("频率单位:", data.units_sweeps.get("Freq"))
print("设计参数组合:", data.variations)
print("intrinsic 取值:", data.intrinsics)

freq_native, s11 = complex_xy(data, EXPRESSIONS[0])
freq_hz = frequency_to_hz(freq_native, data.units_sweeps["Freq"])
```

`complex_xy()` 基于公开的 `get_expression_data(formula="real"/"imag")` 重建复数，校验 x 对齐、长度和有限值。它不启动 AEDT，也不修改 PyAEDT 源码。

### 4.2 幅度、dB、相位与回波损耗

```python
import numpy as np

magnitude = np.abs(s11)
with np.errstate(divide="ignore"):
    s11_db = 20.0 * np.log10(magnitude)
phase_deg = np.angle(s11, deg=True)
phase_rad = np.angle(s11)
phase_unwrapped_rad = np.unwrap(phase_rad)
return_loss_db = -s11_db
```

S 参数幅度使用 `20 log10(|S|)`；已经请求 `dB(S(...))` 时，不要再次调用 `db20`，否则会重复变换。幅度为零时 dB 是 `-inf`，这与原始数据中的 NaN/异常值不同。相位在零幅度处没有物理定义，应在分析时屏蔽。

若仅需 AEDT 已计算的 dB 曲线，可请求 `expressions="dB(S(Port1,Port1))"`，随后 `get_expression_data(expression="dB(S(Port1,Port1))", formula="real")`。

`formula="phase"/"phasedeg"/"phaserad"` 的实现差异已通过离线数据复现，见第 13 节；本手册推荐从复数明确计算相位。

## 5. CSV 与 Touchstone 导出

### 5.1 推荐：显式写入实部和虚部

```python
csv_path = write_complex_csv(data, EXPRESSIONS, OUT / "sparams_complex.csv")
print(csv_path)
```

此 CSV 保留原始 x 单位，按每个表达式输出 `Real`、`Imag` 列，只导出当前 active variation 和当前切片。如果要全参数扫描结果，应显式循环，见第 7 节。

`data.export_data_to_csv(output="完整路径.csv", delimiter=",")` 在 1.9.0 存在，但复数列行为已发现异常，**不作为无损复数归档的默认方案**。具体复现见 [VALIDATION.md](VALIDATION.md)。它与 `app.post.export_report_to_csv()` 是不同的导出路径。

### 5.2 已有原生报告导出

```python
REPORT_NAME = "Sparams"
if REPORT_NAME not in app.post.all_report_names:
    raise RuntimeError("原生报告不存在")
csv_path = checked_call(
    app.post.export_report_to_csv,
    project_dir=str(OUT),       # 目录，不是完整 CSV 文件名
    plot_name=REPORT_NAME,
)
require_file(csv_path)
```

文件通常为 `<目录>/<报告名>.csv`。还应读取表头，确认表达式、单位和曲线数量。`uniform=True` 配合 `start/end/step` 是**导出重采样**，不代表重新求解；默认 `uniform=False` 保留报告的数据点。[官方报告 CSV 接口](https://aedt.docs.pyansys.com/version/stable/API/visualization/_autosummary/ansys.aedt.core.visualization.post.post_common_3d.PostProcessor3D.export_report_to_csv.html)

### 5.3 Touchstone：setup 和 sweep 分开传

```python
touchstone_path = OUT / "network.s2p"  # 两个网络端口的例子，按实际维数选择 .sNp
checked_call(
    app.export_touchstone,
    setup="Setup1",
    sweep="Sweep1",
    output_file=str(touchstone_path),
    renormalization=False,
    gamma_impedance_comments=True,
)
require_file(touchstone_path)
```

这里不传 `setup_sweep_name`。若需导出阶段重归一化，显式设置 `renormalization=True, impedance=50`，并将设置写入结果说明；不要把它与模型端口的归一化设置混为一谈。多模波端口的网络维数可能超过物理端口数；验证 Touchstone 的实际矩阵阶数、参考阻抗、频率单位和 S 参数格式。[官方 Touchstone 接口](https://aedt.docs.pyansys.com/version/stable/API/_autosummary/ansys.aedt.core.hfss.Hfss.export_touchstone.html)

扫描参数可用 `variations=["W"]` 与 `variations_value=["2mm"]` 指定，两者按位置对应。不要把报告接口的 `variations={...}` 字典直接传给这个接口。

## 6. 创建 HFSS 原生报告与导出图片

### 6.1 创建 Results 树中的曲线

```python
REPORT_NAME = "Sparams"
if REPORT_NAME in app.post.all_report_names:
    raise RuntimeError("报告名已存在；检查并复用现有报告，或指定明确的新名称")
report = checked_call(
    app.post.create_report,
    expressions=["dB(S(Port1,Port1))", "dB(S(Port2,Port1))"],
    setup_sweep_name=SOLUTION,
    domain="Sweep",
    variations=FAMILIES,
    primary_sweep_variable="Freq",
    report_category=CATEGORY,
    plot_type="Rectangular Plot",
    plot_name=REPORT_NAME,
    matplotlib=False,
)
if REPORT_NAME not in app.post.all_report_names:
    raise RuntimeError("报告创建后未出现在 Results 中")
```

`create_report()` 已经创建报告，无需再调用 `report.create()`。只有通过 factory 构造报告对象时，才另行调用 `.create()`。[官方 create_report](https://aedt.docs.pyansys.com/version/stable/API/visualization/_autosummary/ansys.aedt.core.visualization.post.post_common_3d.PostProcessor3D.create_report.html)

Factory 写法适合先配置：

```python
report = app.post.reports_by_category.modal_solution(
    expressions=["dB(S(Port1,Port1))"],
    setup=SOLUTION,
)
report.variations = FAMILIES
report.primary_sweep = "Freq"
checked_call(report.create, name="S11_Configured")
```

Terminal 工程使用 `terminal_solution()`。Factory 的参数叫 **`setup`**，不是 `setup_sweep_name`。

### 6.2 坐标轴与图片

```python
checked_call(report.edit_x_axis_scaling, min_scale="6GHz", max_scale="10GHz", units="GHz")
checked_call(report.edit_y_axis_scaling, name="Y1", min_scale="-40", max_scale="0")

image_path = OUT / "Sparams.jpg"
checked_call(
    app.post.export_report_to_jpg,
    project_path=str(image_path),
    plot_name=report.plot_name,
    width=1600,
    height=900,
)
require_file(image_path)
```

轴范围必须按实际数据调整。`export_report_to_jpg()` 的 `project_path` 可以是目录或完整图片路径，返回布尔值；`image_format` 默认为 `"jpg"`。若改为其他图片格式，验证实际输出，而不要只改扩展名。图形相关接口可能要求图形模式；纯数组导出和图片导出应分别判断成功状态。[官方图片接口](https://aedt.docs.pyansys.com/version/stable/API/visualization/_autosummary/ansys.aedt.core.visualization.post.post_common_3d.PostProcessor3D.export_report_to_jpg.html)

### 6.3 报告配置模板

```python
config_path = OUT / "sparams_report.json"
checked_call(report.export_config, output_file=str(config_path))
require_file(config_path)

report = checked_call(
    app.post.create_report_from_configuration,
    input_file=str(config_path),
    solution_name=SOLUTION,
    name="Sparams_FromTemplate",
)
```

配置应先由有效报告导出，之后在匹配的设计中复用，并核对表达式、variation 和上下文。不要凭空编造 JSON schema。[官方配置创建接口](https://aedt.docs.pyansys.com/version/stable/API/visualization/_autosummary/ansys.aedt.core.visualization.post.post_common_3d.PostProcessor3D.create_report_from_configuration.html)

`delete_report(plot_name=None)` 可删除全部报告。需要删除时必须传明确名称，并先查询其存在性。

## 7. 参数扫描与多维数据

```python
families = deepcopy(FAMILIES)
families["W"] = ["All"]   # 仅在 W 对应的参数组合已经求解时有效
data = checked_call(
    app.post.get_solution_data,
    expressions=EXPRESSIONS,
    setup_sweep_name=SOLUTION,
    variations=families,
    primary_sweep_variable="Freq",
    report_category=CATEGORY,
)
for index, variation in enumerate(data.variations):
    if not 0 <= index < data.number_of_variations:
        raise IndexError(index)
    checked_call(data.set_active_variation, var_id=index)
    write_complex_csv(data, EXPRESSIONS, OUT / f"sparams_var_{index:03d}.csv")
    # 同时将 variation 保存为 JSON，才能追溯每个文件对应的参数。
```

`variations` 是请求的 families；`data.variations` 通常列出返回的设计参数组合。频率、Theta、Phi 等 intrinsic 由 `data.intrinsics` 和 `data.active_intrinsic` 管理，不能把每个角度都当作独立设计 variation。

一维提取默认将除主轴以外的 intrinsic 固定在 active 值。需要 Theta/Phi/Freq 多维结果时，先明确切片，或使用 `get_expression_data(sweeps=[...])` 获取多列坐标并自行处理形状。不要直接将多维数组 `flatten()` 后与单个频率轴拼接。

## 8. Gamma 传播常数

用于 Modal 波端口例子；表达式中的端口名和模式号应取自实际工程。

```python
gamma_expressions = ["re(Gamma(WG1:1))", "im(Gamma(WG1:1))"]
gamma = checked_call(
    app.post.get_solution_data,
    expressions=gamma_expressions,
    setup_sweep_name=SOLUTION,
    variations=FAMILIES,
    primary_sweep_variable="Freq",
    report_category="Modal Solution Data",
)
x_alpha, alpha = gamma.get_expression_data(expression=gamma_expressions[0], formula="real")
x_beta, beta = gamma.get_expression_data(expression=gamma_expressions[1], formula="real")
print(gamma.units_data)
```

已经请求 `im(Gamma(...))` 时，用 `formula="real"` 读取该实数表达式；再取 `imag` 会得到其虚部，通常为零。单位应从结果读取。工程若要求原生模态 Gamma，使用该结果，不用 S21 相位近似替代。

物理量枚举可能不完整。若 HFSS 的 Results 对话框确认表达式可用，可进行一次明确的表达式读取并验证；不要仅凭空枚举反复更换函数或重跑求解。

## 9. 远场、增益与方向图

### 9.1 读取已有 Infinite Sphere 的方向图

要求已有有效远场设置、可用辐射场数据以及匹配的频率和激励状态。这里只读取，不能将新建 sphere 或重新求解作为自动兜底。

```python
SPHERE = "Infinite Sphere1"
FF_SOLUTION = "Setup1 : LastAdaptive"
FF_FREQ = "10GHz"  # 必须有相应场结果
if SPHERE not in app.field_setup_names:
    raise RuntimeError("指定远场上下文不存在")
ff_families = deepcopy(app.available_variations.nominal_values)
ff_families.update({"Freq": [FF_FREQ], "Theta": ["All"], "Phi": ["0deg"]})
FF_EXPR = "RealizedGainTotal"  # 先核对该上下文的可用物理量
ff_data = checked_call(
    app.post.get_solution_data,
    expressions=FF_EXPR,
    setup_sweep_name=FF_SOLUTION,
    variations=ff_families,
    primary_sweep_variable="Theta",
    report_category="Far Fields",
    context=SPHERE,
)
theta, gain_linear = ff_data.get_expression_data(expression=FF_EXPR, formula="real")
print(ff_data.units_sweeps, ff_data.units_data)
```

`GainTotal` 与 `RealizedGainTotal` 含义不同，应按所需指标选择。需要 dB 可直接请求 `dB(RealizedGainTotal)` 并按实数读取，或对已确认的线性功率比使用 `10 log10`。不要对功率比使用 S 参数的 `20 log10`。

创建方向图使用 `app.post.create_report()`，保持相同 `variations/context`，设置 `plot_type="Radiation Pattern"`；该显示类型应先在实际工程中确认可用。

### 9.2 FFD 与天线数据：调用入口在 Hfss

```python
if SPHERE not in app.field_setup_names:
    raise RuntimeError("必须先确认已有 sphere；避免此方法自动创建新 sphere")
antenna = checked_call(
    app.get_antenna_data,
    frequencies=[FF_FREQ],
    setup=FF_SOLUTION,
    sphere=SPHERE,
    overwrite=False,
    link_to_hfss=False,
    export_touchstone=False,
    set_phase_center_per_port=False,
)
print(type(antenna))
```

1.9.0 的入口是 **`app.get_antenna_data()`**，不是 `app.post.get_antenna_data()`。它执行 FFD 导出，并根据 `link_to_hfss` 返回 exporter 或独立 FFD 数据对象，不能按 `SolutionData` 使用。未提供有效 sphere 时可能自动新建；默认可能设置端口相位中心并导出 Touchstone，因此示例显式控制这些选项。导出位置由 exporter 管理，此接口没有 `output_file` 参数。[官方天线数据接口](https://aedt.docs.pyansys.com/version/stable/API/_autosummary/ansys.aedt.core.hfss.Hfss.get_antenna_data.html)

## 10. 场图、场数据与场标量

场数据依赖保存过的场解。完整频率 S 参数可用，不代表每个频点都有可读取的场数据；扫频类型和保存场的设置会影响结果。

### 10.1 表面场图和图片

```python
FIELD_SOLUTION = "Setup1 : LastAdaptive"
INTRINSICS = {"Freq": "10GHz", "Phase": "0deg"}
OBJECT_NAME = "Patch"  # 已存在对象
if OBJECT_NAME not in app.modeler.object_names:
    raise RuntimeError("指定场图对象不存在")
plot = checked_call(
    app.post.create_fieldplot_surface,
    assignment=[OBJECT_NAME],
    quantity="Mag_E",
    setup=FIELD_SOLUTION,
    intrinsics=INTRINSICS,
    plot_name="E_Surface_10GHz",
)
image_path = OUT / "E_Surface_10GHz.jpg"
checked_call(
    app.post.export_field_jpg,
    file_name=str(image_path),
    plot_name=plot.name,
    folder_name=plot.plot_folder,
    orientation="isometric",
)
require_file(image_path)
```

表面场图支持对象名、对象列表或 face 对象列表；按需求选择真正的表面，避免把一张面与整个实体表面混淆。`setup`、`quantity` 是此接口的参数名，不是 `setup_sweep_name`、`quantity_name`。[官方表面场图接口](https://aedt.docs.pyansys.com/version/stable/API/visualization/_autosummary/ansys.aedt.core.visualization.post.post_common_3d.PostProcessor3D.create_fieldplot_surface.html)

### 10.2 点采样场数据

```python
field_path = OUT / "E_samples.fld"
checked_call(
    app.post.export_field_file,
    quantity="Mag_E",
    solution=FIELD_SOLUTION,
    output_file=str(field_path),
    sample_points=[[0.0, 0.0, 0.0], [0.001, 0.0, 0.0]],
    intrinsics=INTRINSICS,
    reference_coordinate_system="Global",
    export_in_si_system=True,
)
require_file(field_path)
```

采样坐标、模型单位、输出 SI 单位和参考坐标系应单独核对；用已知点验证坐标对应关系，不能从 `export_in_si_system` 猜测所有输入坐标的解释。网格采样接口是 `export_field_file_on_grid()`，它的输出参数名是 **`file_name`**。

### 10.3 最大值、最小值等标量

```python
e_max = app.post.get_scalar_field_value(
    quantity="Mag_E",
    scalar_function="Maximum",
    solution=FIELD_SOLUTION,
    object_name=OBJECT_NAME,
    object_type="surface",
    intrinsics=INTRINSICS,
)
if e_max is False or e_max is None:
    raise RuntimeError("场标量提取失败")
print(e_max)
```

检查错误值使用 `is False`，不要写 `if not e_max`，因为零可能是有效结果。明确 scalar_function 所作用的几何区域，验证物理量和单位。

## 11. 收敛、网格与求解耗时

```python
convergence_path = checked_call(
    app.export_convergence, setup="Setup1", variations="", output_file=str(OUT / "convergence.txt")
)
mesh_path = checked_call(
    app.export_mesh_stats, setup="Setup1", variations="", output_file=str(OUT / "mesh_stats.txt")
)
profile_path = checked_call(
    app.export_profile, setup="Setup1", variation="", output_file=str(OUT / "profile.prof")
)
for path in (convergence_path, mesh_path, profile_path):
    require_file(path)
```

`export_convergence` 和 `export_mesh_stats` 使用 **`variations`**；`export_profile` 使用单数 **`variation`**。这些参数是该接口所需的 variation 字符串，不是报告的 families 字典。空字符串使用名义组合；参数扫描工程应明确组合并核对实际导出内容。

导出文件存在与仿真达标是不同判断。查看最终自适应误差、pass 数、网格增长、终止原因和目标频段性能；不把“能生成报告”当作“已收敛”。

`app.export_results()` 可批量导出结果，但输出范围、阻抗/格式默认值比单项接口更广；精确任务优先逐项指定文件和设置。

## 12. 独立图表与 PDF 报告

### 12.1 从已读取数组生成 PNG

```python
import matplotlib
matplotlib.use("Agg")
import matplotlib.pyplot as plt

fig, ax = plt.subplots(figsize=(7, 4), layout="constrained")
ax.plot(freq_hz / 1e9, s11_db, label="S11")
ax.set(xlabel="Frequency (GHz)", ylabel="S parameter (dB)")
ax.grid(True, alpha=0.3)
ax.legend()
png_path = OUT / "s11.png"
fig.savefig(png_path, dpi=220)
plt.close(fig)
require_file(png_path)
```

也可使用 `data.plot(curves=..., formula=..., snapshot_path=..., show=False)`；它返回 `ReportPlotter`，不能把它当作 `matplotlib.figure.Figure` 直接调用 `.savefig()`。`plot()` 的 formula 支持值与 `get_expression_data()` 不完全相同，查本地签名和说明。

### 12.2 1.9.0 的 AnsysReport

原生 Results 报告与独立 PDF 是不同产物。1.9.0 的 `AnsysReport` 使用 **pdf-oxide**，旧版 FPDF 示例不应直接沿用；`pdf-oxide` 属于当前 `graphics` 等 extras 的依赖。[1.9.0 发布记录](https://github.com/ansys/pyaedt/releases/tag/v1.9.0)

```python
from ansys.aedt.core.visualization.plot.pdf import AnsysReport

pdf = AnsysReport(version="2026.1", design_name=EXPECTED_DESIGN, project_name=EXPECTED_PROJECT.stem)
pdf.create()
pdf.add_chapter("S parameters")
pdf.add_text("PyAEDT 1.9.0; solution: " + SOLUTION)
pdf.add_image(path=str(png_path), caption="S11 versus frequency")
pdf.add_table(title="Run metadata", content=[
    ["Item", "Value"], ["Solution", SOLUTION], ["Frequency unit", "GHz"],
])
pdf_path = pdf.save_pdf(file_path=str(OUT), file_name="simulation_report.pdf")
require_file(pdf_path)
```

`save_pdf(file_path, file_name)` 的第一个参数是输出目录，第二个参数是文件名。PDF 接口未在本次运行中实际生成文件。正式使用还要核对字体、中文、分页和图片排版；仅通过签名检查不代表版式验证完成。需要中文或严格表格布局时，可使用独立文档生成器消费 CSV/JSON/PNG。

## 13. 已发现的接口陷阱

以下结论限定于本次核对的 **1.9.0 发布包**；实现差异使用合成数据离线复现，未据此声称实际 HFSS 工程全部功能已验证。具体脚本和数值见 [VALIDATION.md](VALIDATION.md)。

| 易错写法/现象 | 原因与推荐处理 |
| --- | --- |
| `data.data_real()`、`data.data_db20()` | 在 1.9.0 中未发现这些方法；使用 `get_expression_data()` |
| `app.post.get_antenna_data()` | 此入口不存在；调用 `app.get_antenna_data()` |
| 从 dB 表达式继续做 db20 | 二次对数变换；dB 表达式按实数读取 |
| `get_expression_data(formula="phasedeg")` | 离线测试返回弧度数值；`phaserad` 又乘了 π/180；使用实部/虚部配合 `np.angle` |
| 复数 `export_data_to_csv()` | 离线测试中遗漏虚部列；使用本目录显式复数 CSV helper 或验证过的 Touchstone |
| 只依靠类型注解/True 返回值 | 部分接口可能返回失败值或只代表 API 调用完成；检查数据及实际文件 |
| 给 `get_solution_data()` 传 `secondary_sweep_variable` | 参数不存在，虽然部分原始 docstring 示例包含它；该参数属于 `create_report()` |
| 将 `setup` 与 `setup_sweep_name` 混用 | 报告读取、factory、场图、Touchstone 使用不同参数名，按第 2 节区分 |
| 以 `None` 单位判断 Gamma 失败 | 单位显示与表达式能否取得结果分开验证 |
| 无报表/导出文件就重跑求解 | 先核对 solution、类别、表达式、variation、字段数据和路径，已有解可单独后处理 |
| 给 `Hfss.release_desktop()` 传 `close_on_exit` | Hfss 使用 `close_desktop`；Desktop 使用 `close_on_exit` |

退出已有用户会话时，若仅释放 Python 控制，可按对象类型调用：

```python
app.release_desktop(close_projects=False, close_desktop=False)
# 或者对已有 Desktop 实例：
desktop.release_desktop(close_projects=False, close_on_exit=False)
```

两行是两种入口示例，不要求重复调用。关闭或保存工程由运行脚本的所有权和任务范围决定。[官方会话管理](https://aedt.docs.pyansys.com/version/stable/User_guide/desktop_sessions.html)

## 14. 提高正确调用率的工程方案

### 14.1 使用“手册 + 固定版本快照 + 调用前核验”

| 文件 | 用途 | 日常是否联网 |
| --- | --- | --- |
| `README.md` | 本手册：按需求找调用路径和示例 | 否 |
| `api_snapshot.md` | 69 个接口/属性完整签名和原始说明 | 否 |
| `api_snapshot.json` | 机器可读快照、源码位置与 SHA-256 | 否 |
| `post_helpers.py` | 参数预绑定、数据检查、显式频率单位、复数 CSV | 否 |
| `verify_offline.py` | 检查手册 Python 语法/调用参数与合成数据处理 | 否 |
| `refresh_api_snapshot.py` | 按执行它的 Python 环境重新生成快照 | 否 |
| `compare_official_docs.py` | 维护时对照官方 stable 文档参数与默认值 | **是，仅维护时** |
| `official_doc_check.json` / `VALIDATION.md` | 本次文档对照与离线验证证据 | 否 |

`checked_call()` 先执行 `inspect.signature(function).bind(...)` 再进入 PyAEDT 方法，能提前拒绝参数拼写、数量错误。它不自动丢弃未知参数，不替换失败的物理量，不盲目重试，仍需检查工程层面的数据有效性。

### 14.2 在工程中加入简短调用约定

可将下面内容合并到工程的 `AGENTS.md` 或开发说明中；本次没有自动修改全局技能或记忆。

```markdown
PyAEDT 后处理先读 docs/pyaedt-postprocessing/README.md 与 api_snapshot.md。
目标 API 基准是 PyAEDT 1.9.0；运行前核对实际环境，记录 AEDT/Python/PyAEDT 版本。
参数有疑问时先查本地快照或 inspect.signature，不默认联网或反复试错。
后处理显式指定 project/design/solution/variation/expression/context。
已有求解结果的后处理不触发新的求解。结果按数据和文件内容验证。
仅在升级依赖、快照缺失或确认版本冲突时对照官方文档。
```

### 14.3 离线检查与更新

在包含本目录的工程中，用目标环境的 Python 执行：

```powershell
# $taskPython 指向安装了目标 PyAEDT 的解释器；不要改动系统环境变量。
& $taskPython .\docs\pyaedt-postprocessing\verify_offline.py

# 生成到带版本的独立目录，避免把现有 1.9.0 基准覆盖为本机旧版本。
& $taskPython .\docs\pyaedt-postprocessing\refresh_api_snapshot.py --output-dir .\docs\pyaedt-postprocessing\snapshots\your-version

# 升级后才需要联网对照；它检查执行环境，不负责升级安装包。
& $taskPython .\docs\pyaedt-postprocessing\compare_official_docs.py --output-dir .\docs\pyaedt-postprocessing\snapshots\your-version
```

建议运行产物同时保存 `manifest.json`：包括 AEDT/PyAEDT/Python 版本、绝对工程路径、设计名、solution、families、expressions、context、单位、数据点数、归一化设置、导出文件和时间。这样能复现结果，也能区分版本问题与工程上下文问题。

## 15. 官方参考入口

平时使用本地快照；下列链接供升级维护和核查出处。

- [PyAEDT 1.9.0 发布与兼容性](https://pypi.org/project/pyaedt/1.9.0/)
- [API 总览](https://aedt.docs.pyansys.com/version/stable/API/index.html)
- [PostProcessor3D](https://aedt.docs.pyansys.com/version/stable/API/visualization/_autosummary/ansys.aedt.core.visualization.post.post_common_3d.PostProcessor3D.html)
- [SolutionData](https://aedt.docs.pyansys.com/version/stable/API/visualization/_autosummary/ansys.aedt.core.visualization.post.solution_data.SolutionData.html)
- [Hfss](https://aedt.docs.pyansys.com/version/stable/API/_autosummary/ansys.aedt.core.hfss.Hfss.html)
- [AnsysReport](https://aedt.docs.pyansys.com/version/stable/API/visualization/_autosummary/ansys.aedt.core.visualization.plot.pdf.AnsysReport.html)
- [固定 tag v1.9.0 源码](https://github.com/ansys/pyaedt/tree/v1.9.0)

`stable` 是会随发布变化的入口。本目录的 JSON/Markdown 快照固定保存 1.9.0 签名；后续访问 stable 时，应先检查首页版本，不能将新文档当作旧环境的调用依据。
