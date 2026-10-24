# PyAEDT 后处理 API 本机快照

- PyAEDT：`1.9.0`
- Python：`3.10.11`
- 解释器：`[本机环境路径已隐藏]`。
- 生成时间（UTC）：`2026-10-13T04:37:44.220022+00:00`
- PyAEDT 包入口：`[本机环境路径已隐藏]`。
- 生成过程只导入类并读取签名/源码；未实例化 Desktop/Hfss，未连接或启动 AEDT。
- 此文件保存本机安装包的接口事实，升级环境后重新生成。
- 英文参数/返回说明摘自 MIT 授权源码的 docstring；不是联网网页缓存。
- 为避免旧示例中的错误参数，未收录原始 Examples 段；调用示例请查 README.md。
- 实际参数以 signature 为准，实现差异和数值验证请查 VALIDATION.md。

## 接口索引

| 名称 | 类型 |
| --- | --- |
| `Hfss.export_touchstone` | method |
| `Hfss.export_convergence` | method |
| `Hfss.export_mesh_stats` | method |
| `Hfss.export_profile` | method |
| `Hfss.export_results` | method |
| `Hfss.get_antenna_data` | method |
| `Hfss.release_desktop` | method |
| `Hfss.project_file` | property |
| `Hfss.design_name` | property |
| `Hfss.existing_analysis_sweeps` | property |
| `Hfss.excitation_names` | property |
| `Hfss.field_setup_names` | property |
| `Desktop.release_desktop` | method |
| `PostProcessor3D.get_solution_data` | method |
| `PostProcessor3D.create_report` | method |
| `PostProcessor3D.available_report_solutions` | method |
| `PostProcessor3D.available_report_quantities` | method |
| `PostProcessor3D.available_quantities_categories` | method |
| `PostProcessor3D.export_report_to_csv` | method |
| `PostProcessor3D.export_report_to_file` | method |
| `PostProcessor3D.export_report_to_jpg` | method |
| `PostProcessor3D.create_report_from_configuration` | method |
| `PostProcessor3D.delete_report` | method |
| `PostProcessor3D.all_report_names` | property |
| `PostProcessor3D.available_report_types` | property |
| `PostProcessor3D.create_fieldplot_surface` | method |
| `PostProcessor3D.create_fieldplot_volume` | method |
| `PostProcessor3D.create_fieldplot_cutplane` | method |
| `PostProcessor3D.export_field_file` | method |
| `PostProcessor3D.export_field_file_on_grid` | method |
| `PostProcessor3D.export_field_jpg` | method |
| `PostProcessor3D.get_scalar_field_value` | method |
| `Reports.standard` | method |
| `Reports.modal_solution` | method |
| `Reports.terminal_solution` | method |
| `Reports.far_field` | method |
| `SolutionData.get_expression_data` | method |
| `SolutionData.export_data_to_csv` | method |
| `SolutionData.plot` | method |
| `SolutionData.set_active_variation` | method |
| `SolutionData.primary_sweep` | property |
| `SolutionData.primary_sweep_values` | property |
| `SolutionData.expressions` | property |
| `SolutionData.intrinsics` | property |
| `SolutionData.active_variation` | property |
| `SolutionData.active_intrinsic` | instance_attribute |
| `SolutionData.enable_pandas_output` | property |
| `SolutionData.units_sweeps` | instance_attribute |
| `SolutionData.units_data` | instance_attribute |
| `SolutionData.variations` | instance_attribute |
| `SolutionData.number_of_variations` | instance_attribute |
| `SolutionData.full_matrix_real_imag` | property |
| `SolutionData.full_matrix_mag_phase` | property |
| `CommonReport.create` | method |
| `CommonReport.get_solution_data` | method |
| `CommonReport.export_config` | method |
| `CommonReport.edit_x_axis_scaling` | method |
| `CommonReport.edit_y_axis_scaling` | method |
| `CommonReport.add_cartesian_y_marker` | method |
| `SetupHFSS.get_solution_data` | method |
| `AnsysReport.__init__` | method |
| `AnsysReport.create` | method |
| `AnsysReport.add_chapter` | method |
| `AnsysReport.add_sub_chapter` | method |
| `AnsysReport.add_text` | method |
| `AnsysReport.add_image` | method |
| `AnsysReport.add_table` | method |
| `AnsysReport.add_chart` | method |
| `AnsysReport.save_pdf` | method |

## Hfss.export_touchstone

类型：`method`

```text
Hfss.export_touchstone(self, setup: str | None = None, sweep: str | None = None, output_file: str | None = None, variations: list | None = None, variations_value: list | None = None, renormalization: bool = False, impedance: float | None = None, gamma_impedance_comments: bool = False) -> str | bool
```

源码：`ansys/aedt/core/generic/general_methods.py:413`
源码文件 SHA-256：`1f7b7af67ebd4f6c2ae954cf2cf9e9ecf4a6371769d6845abd31a32ab1fc24fc`

````text
Export a Touchstone file.

Parameters
----------
setup : str, optional
    Name of the setup that has been solved.
sweep : str, optional
    Name of the sweep that has been solved.
output_file : str, optional
    Full path and name for the Touchstone file.
    The default is ``None``, in which case the Touchstone file is exported to
    the working directory.
variations : list, optional
    List of all parameter variations. For example, ``["$AmbientTemp", "$PowerIn"]``.
    The default is ``None``.
variations_value : list, optional
    List of all parameter variation values. For example, ``["22cel", "100"]``.
    The default is ``None``.
renormalization : bool, optional
    Perform renormalization before export.
    The default is ``False``.
impedance : float, optional
    Real impedance value in ohm, for renormalization, if not specified considered 50 ohm.
    The default is ``None``.
gamma_impedance_comments : bool, optional
    Include Gamma and Impedance values in comments.
    The default is ``False``.

Returns
-------
str
    Filename when successful, ``False`` when failed.

References
----------
>>> oDesign.ExportNetworkData
````

## Hfss.export_convergence

类型：`method`

```text
Hfss.export_convergence(self, setup: 'str', variations: 'str' = '', output_file: 'str' = None) -> 'str'
```

源码：`ansys/aedt/core/generic/general_methods.py:1100`
源码文件 SHA-256：`1f7b7af67ebd4f6c2ae954cf2cf9e9ecf4a6371769d6845abd31a32ab1fc24fc`

````text
Export a solution convergence to a file.

Parameters
----------
setup : str
    Setup name. For example, ``'Setup1'``.
variations : str
    Variation string with values. For example, ``'radius=3mm'``.
output_file : str, optional
    Full path to the PROF file. The default is ``None``, in which
    case the working directory is used.


Returns
-------
str
    Output file path if created.

References
----------
>>> oModule.ExportConvergence
````

## Hfss.export_mesh_stats

类型：`method`

```text
Hfss.export_mesh_stats(self, setup: 'str', variations: 'str' = '', output_file: 'str' = None) -> 'str'
```

源码：`ansys/aedt/core/generic/general_methods.py:376`
源码文件 SHA-256：`1f7b7af67ebd4f6c2ae954cf2cf9e9ecf4a6371769d6845abd31a32ab1fc24fc`

````text
Export mesh statistics to a file.

Parameters
----------
setup : str
    Setup name.
variations : str, optional
    Variation list. The default is ``""``.
output_file : str, optional
    Full path to the mesh statistics file. The default is ``None``, in which
    caswe the working directory is used.

Returns
-------
str
    File path to the mesh statistics file.

References
----------
>>> oDesign.ExportMeshStats
````

## Hfss.export_profile

类型：`method`

```text
Hfss.export_profile(self, setup: str, variation: str = '', output_file: str = None) -> str
```

源码：`ansys/aedt/core/generic/general_methods.py:1968`
源码文件 SHA-256：`1f7b7af67ebd4f6c2ae954cf2cf9e9ecf4a6371769d6845abd31a32ab1fc24fc`

````text
Export a solution profile to a PROF file.

Parameters
----------
setup : str
    Setup name. For example, ``'Setup1'``.
variation : str
    Variation string with values. For example, ``'radius=3mm'``.
output_file : str, optional
    Full path to the PROF file. The default is ``None``, in which case
    the working directory is used.


Returns
-------
str
    File path if created.

References
----------
>>> oDesign.ExportProfile
````

## Hfss.export_results

类型：`method`

```text
Hfss.export_results(self, export_folder: 'str' = None, matrix_name: 'str' = 'Original', matrix_type: 'str' = 'S', touchstone_format: 'str' = 'MagPhase', touchstone_number_precision: 'int' = 15, length: 'str' = '1meter', impedance: 'float' = 50, include_gamma_comment: 'bool' = True, support_non_standard_touchstone_extension: 'bool' = False, variations: 'list' = None) -> 'list[str]'
```

源码：`ansys/aedt/core/generic/general_methods.py:851`
源码文件 SHA-256：`1f7b7af67ebd4f6c2ae954cf2cf9e9ecf4a6371769d6845abd31a32ab1fc24fc`

````text
Export all available reports to a file, including profile, and convergence and sNp when applicable.

Parameters
----------
export_folder : str, optional
    Full path to the project folder. The default is ``None``, in which case the
    working directory is used.
matrix_name : str, optional
    Matrix to specify to export touchstone file.
    The default is ``Original``, in which case default matrix is taken.
    This argument applies only to 2DExtractor and Q3D setups where Matrix reduction is computed
    and needed to export touchstone file.
matrix_type : str, optional
    Type of matrix to export. The default is ``S`` to export a touchstone file.
    Available values are ``S``, ``Y``, ``Z``.  ``Y`` and ``Z`` matrices will be exported as tab file.
touchstone_format : str, optional
    Touchstone format. The default is ``MagPahse``.
    Available values are: ``MagPahse``, ``DbPhase``, ``RealImag``.
length : str, optional
    Length of the model to export. The default is ``1meter``.
impedance : float, optional
    Real impedance value in ohms, for renormalization. The default is ``50``.
touchstone_number_precision : int, optional
    Touchstone number of digits precision. The default is ``15``.
include_gamma_comment : bool, optional
    Specifies whether to include Gamma and Impedance comments. The default is ``True``.
support_non_standard_touchstone_extension : bool, optional
    Specifies whether to support non-standard Touchstone extensions for mixed reference impedance.
    The default is ``False``.
variations : list, optional
    List of variation values with units. The default is all variations.

Returns
-------
list
    List of all exported files.

References
----------
>>> oModule.GetAllPortsList
>>> oDesign.ExportProfile
>>> oModule.ExportToFile
>>> oModule.ExportConvergence
>>> oModule.ExportNetworkData
````

## Hfss.get_antenna_data

类型：`method`

```text
Hfss.get_antenna_data(self, frequencies: 'float | list | None' = None, setup: 'str | None' = None, sphere: 'str | None' = None, variations: 'dict | None' = None, overwrite: 'bool | None' = True, link_to_hfss: 'bool | None' = True, export_touchstone: 'bool | None' = True, set_phase_center_per_port: 'bool | None' = True) -> "'FfdSolutionDataExporter | FfdSolutionData | bool'"
```

源码：`ansys/aedt/core/generic/general_methods.py:6215`
源码文件 SHA-256：`1f7b7af67ebd4f6c2ae954cf2cf9e9ecf4a6371769d6845abd31a32ab1fc24fc`

````text
Export the antenna parameters to Far Field Data (FFD) files and return an
instance of the ``FfdSolutionDataExporter`` object.

For phased array cases, only one phased array is calculated.

Parameters
----------
frequencies : float or list of float or str, optional
    Frequency value or list of frequencies to compute far field data. The default is ``None,`` in which case
    all available frequencies are computed.
setup : str, optional
    Name of the setup to use. The default is ``None,`` in which case ``nominal_adaptive`` is used.
sphere : str, optional
    Infinite sphere to use. The default is ``None``, in which case an existing sphere is used or a new
    one is created.
variations : dict, optional
    Variation dictionary. The default is ``None``, in which case the nominal variation is exported.
overwrite : bool, optional
    Whether to overwrite FFD files. The default is ``True``.
link_to_hfss : bool, optional
    Whether to return an instance of the
    :class:`ansys.aedt.core.visualization.advanced.farfield_exporter.FfdSolutionDataExporter` class,
    which requires a connection to an instance of the :class:`Hfss` class.
    The default is ``True``. If ``False``, returns an instance of
    :class:`ansys.aedt.core.visualization.advanced.farfield_visualization.FfdSolutionData` class, which is
    independent of the running HFSS instance.
export_touchstone : bool, optional
    Whether to export touchstone file. The default is ``True``.
set_phase_center_per_port : bool, optional
    Set phase center per port location. The default is ``True``.

Returns
-------
:class:`ansys.aedt.core.visualization.advanced.farfield_visualization.FfdSolutionDataExporter` or
:class:`ansys.aedt.core.visualization.advanced.farfield_visualization.FfdSolutionData` or bool
    SolutionData object or False if frequencies could not be obtained.
````

## Hfss.release_desktop

类型：`method`

```text
Hfss.release_desktop(self, close_projects: bool = True, close_desktop: bool = True) -> bool
```

源码：`ansys/aedt/core/generic/general_methods.py:3113`
源码文件 SHA-256：`1f7b7af67ebd4f6c2ae954cf2cf9e9ecf4a6371769d6845abd31a32ab1fc24fc`

````text
Release AEDT.

Parameters
----------
close_projects : bool, optional
    Whether to close all projects. The default is ``True``.
close_desktop : bool, optional
    Whether to close AEDT after releasing it. The default is ``True``.

Returns
-------
bool
    ``True`` when successful, ``False`` when failed.
````

## Hfss.project_file

类型：`property`

源码：`ansys/aedt/core/application/design.py:1067`
源码文件 SHA-256：`814e985c3e811f4647036863ff4d7fea146b231476675233e94a58a8e533ff1a`

````text
Project name and path.

Returns
-------
str
    Full absolute name and path for the project.
````

## Hfss.design_name

类型：`property`

源码：`ansys/aedt/core/application/design.py:862`
源码文件 SHA-256：`814e985c3e811f4647036863ff4d7fea146b231476675233e94a58a8e533ff1a`

````text
Design name.

Returns
-------
str
    Name of the parent AEDT design.

References
----------
>>> oDesign.GetName
>>> oDesign.RenameDesignInstance
````

## Hfss.existing_analysis_sweeps

类型：`property`

源码：`ansys/aedt/core/application/analysis.py:485`
源码文件 SHA-256：`5d6a25796d959fdb9401417738184eba3eb6d330eff8d8de598af3da87665f1b`

````text
Existing analysis sweeps.

Returns
-------
list of str
    List of all analysis sweeps in the design.

References
----------
>>> oModule.GelAllSolutionNames
>>> oModule.GetSweeps
````

## Hfss.excitation_names

类型：`property`

源码：`ansys/aedt/core/application/analysis.py:616`
源码文件 SHA-256：`5d6a25796d959fdb9401417738184eba3eb6d330eff8d8de598af3da87665f1b`

````text
Get all excitation names.

Returns
-------
list
    List of excitation names. Excitations with multiple modes will return one
    excitation for each mode.

References
----------
>>> oModule.GetExcitations
````

## Hfss.field_setup_names

类型：`property`

源码：`ansys/aedt/core/hfss.py:317`
源码文件 SHA-256：`fa4f8767929fa47ad044980c3436d4b7d4f66c1444b6a84223cb968f05fd5dfb`

````text
List of AEDT radiation field names.

Returns
-------
List of str
````

## Desktop.release_desktop

类型：`method`

```text
Desktop.release_desktop(self, close_projects: 'bool | None' = True, close_on_exit: 'bool | None' = True) -> 'bool'
```

源码：`ansys/aedt/core/generic/general_methods.py:2321`
源码文件 SHA-256：`1f7b7af67ebd4f6c2ae954cf2cf9e9ecf4a6371769d6845abd31a32ab1fc24fc`

````text
Release AEDT.

Parameters
----------
close_projects : bool, optional
    Whether to close the AEDT projects that are open in the session.
    The default is ``True``.
close_on_exit : bool, optional
    Whether to close the active AEDT session on exiting AEDT.
    The default is ``True``.

Returns
-------
bool
    ``True`` when successful, ``False`` when failed.
````

## PostProcessor3D.get_solution_data

类型：`method`

```text
PostProcessor3D.get_solution_data(self, expressions: 'str | list' = None, setup_sweep_name: 'str | None' = None, domain: 'str | None' = None, variations: 'dict | None' = None, primary_sweep_variable: 'str | None' = None, report_category: 'str | None' = None, context: 'str | dict | None' = None, subdesign_id: 'int | None' = None, polyline_points: 'int' = 1001, math_formula: 'str | None' = None) -> 'SolutionData | bool'
```

源码：`ansys/aedt/core/generic/general_methods.py:1862`
源码文件 SHA-256：`1f7b7af67ebd4f6c2ae954cf2cf9e9ecf4a6371769d6845abd31a32ab1fc24fc`

````text
Get a simulation result from a solved setup and cast it in a ``SolutionData`` object.

Data to be retrieved from Electronics Desktop are any simulation results available in that
specific simulation context.
Most of the argument have some defaults which works for most of the ``Standard`` report quantities.

Parameters
----------
expressions : str or list, optional
    One or more formulas to add to the report. Example is value ``"dB(S(1,1))"`` or a list of values.
    Default is ``None`` which returns all traces.
setup_sweep_name : str, optional
    Name of the setup. The default is ``None``, in which case the ``nominal_adaptive``
    setup is used. Be sure to build a setup string in the form of
    ``"SetupName : SetupSweep"``, where ``SetupSweep`` is the sweep name to
    use in the export or ``LastAdaptive``.
domain : str, optional
    Plot Domain. Options are "Sweep" for frequency domain related results and "Time" for transient related data.
variations : dict, optional
    Dictionary of all families including the primary sweep.
    The default is ``None`` which uses the nominal variations of the setup.
primary_sweep_variable : str, optional
    Name of the primary sweep. The default is ``"None"`` which, depending on the context,
    internally assigns the primary sweep to:
    1. ``Freq`` for frequency domain results,
    2. ``Time`` for transient results,
    3. ``Theta`` for radiation patterns,
    4. ``distance`` for field plot over a polyline.
report_category : str, optional
    Category of the Report to be created. If ``None`` default data Report is used.
    The Report Category can be one of the types available for creating a report depend on the simulation setup.
    For example for a Far Field Plot in HFSS the UI shows the report category as "Create Far Fields Report".
    The report category is "Far Fields" in this case.
    Depending on the setup different categories are available.
    If ``None`` default category is used (the first item in the Results drop down menu in AEDT).
    To get the list of available categories user can use method ``available_report_types``.
context : str, dict, optional
    This is the context of the report.
    The default is ``None``. It can be:
    1. `None`
    2. ``"Differential Pairs"``
    3. Reduce Matrix Name for Q2d/Q3d solution
    4. Infinite Sphere name for Far Fields Plot.
    5. Dictionary. If dictionary is passed, key is the report property name and value is property value.
    6. For Maxwell 2D/3D eddy current solution types, this can be provided as a dictionary,
    where the key is the matrix name and value the reduced matrix.
subdesign_id : int, optional
    Subdesign ID for exporting a Touchstone file of this subdesign.
    This parameter is valid for ``Circuit`` only.
    The default value is ``None``.
polyline_points : int, optional
    Number of points on which to create the report for plots on polylines.
    This parameter is valid for ``Fields`` plot only.
math_formula : str, optional
    One of the available AEDT mathematical formulas to apply. For example, ``abs, dB``.


Returns
-------
:class:`ansys.aedt.core.visualization.post.solution_data.SolutionData`
    Solution Data object.

References
----------
>>> oModule.GetSolutionDataPerVariation
````

## PostProcessor3D.create_report

类型：`method`

```text
PostProcessor3D.create_report(self, expressions: 'str | list' = None, setup_sweep_name: 'str' = None, domain: 'str' = 'Sweep', variations: 'dict' = None, primary_sweep_variable: 'str' = None, secondary_sweep_variable: 'str' = None, report_category: 'str' = None, plot_type: 'str' = 'Rectangular Plot', context: 'str | dict' = None, subdesign_id: 'int' = None, polyline_points: 'int' = 1001, plot_name: 'str' = None, matplotlib: 'bool' = False, show: 'bool' = True, hide_legend: 'bool' = False, snapshot_path: 'str' = None, width: 'int' = 800, height: 'int' = 450) -> 'Standard | AMIEyeDiagram | AMIConturEyeDiagram | EMIReceiver | EyeDiagram | CircuitNetlistReport | Fields | FarField | NearField | Spectral | ReportPlotter | bool'
```

源码：`ansys/aedt/core/generic/general_methods.py:1637`
源码文件 SHA-256：`1f7b7af67ebd4f6c2ae954cf2cf9e9ecf4a6371769d6845abd31a32ab1fc24fc`

````text
Create a report in AEDT or in Matplotlib. It can be a 2D plot, 3D plot, polar plot, or a data table.

Parameters
----------
expressions : str or list, optional
    One or more formulas to add to the report. Example is value = ``"dB(S(1,1))"``.
setup_sweep_name : str, optional
    Setup name with the sweep. The default is ``None``, in which case the first setup and sweep is selected.
    For Circuit Netlist designs only, specify the solution name as listed in
    :class:`ansys.aedt.core.generic.aedt_constants.CircuitNetlistConstants`.
domain : str, optional
    Plot Domain. Options are "Sweep", "Time", "DCIR".
variations : dict, optional
    Dictionary of all families including the primary sweep. The default is ``{"Freq": ["All"]}``.
primary_sweep_variable : str, optional
    Name of the primary sweep. The default is ``"Freq"``.
secondary_sweep_variable : str, optional
    Name of the secondary sweep variable in 3D Plots.
report_category : str, optional
    Category of the Report to be created. If `None` default data Report is used.
    The Report Category can be one of the types available for creating a report depend on the simulation setup.
    For example for a Far Field Plot in HFSS the UI shows the report category as "Create Far Fields Report".
    The report category is "Far Fields" in this case.
    Depending on the setup different categories are available.
    If ``None`` default category is used (the first item in the Results drop down menu in AEDT).
plot_type : str, optional
    The format of Data Visualization. Default is ``Rectangular Plot``.
context : str, dict, optional
    The default is ``None``.
    - For HFSS 3D Layout, options are ``"Bondwires"``, ``"Differential Pairs"``,
    ``None``, ``"Probes"``, ``"RL"``, ``"Sources"``, and ``"Vias"``.
    - For Q2D or Q3D, specify the name of a reduced matrix.
    - For a far fields plot, specify the name of an infinite sphere.
    - For Maxwell 2D/3D Eddy Current solution types this can be provided as a dictionary
    where the key is the matrix name and value the reduced matrix.
    - For Circuit Design, this can provide the plots' time range as a dictionary
    where the keys are ``"time_start"`` and ``"time_stop"``.
    By default ``"time_start"`` is 0ps and the ``"time_stop"`` is 10ns.
    - For TDR analysis some dictionary options are "pulse_rise_time","step_time",
    "time_windowing","maximum_time","use_pulse_in_tdr","differential_pairs". The default values
    are as they appear manually in the UI.
plot_name : str, optional
    Name of the plot. The default is ``None``.
polyline_points : int, optional,
    Number of points to create the report for plots on polylines on.
subdesign_id : int, optional
    Specify a subdesign ID to export a Touchstone file of this subdesign. Valid for Circuit Only.
    The default value is ``None``.
matplotlib : bool, optional
    Whether to use AEDT or ReportPlotter to generate the plot. Eye diagrams are not supported.
show : bool, optional
    Whether to show the plot when using ReportPlotter. The default is ``True``.
    If matplotlib is ``False``, this parameter is ignored.
hide_legend : bool, optional
    Whether to hide the legend when using AEDT reporter. The default is ``False``.
snapshot_path : str, optional
    Full path to image file if a snapshot is needed.
    The default is ``None``.
width : int, optional
    Snapshot image width. Default is ``800`` which takes Desktop size or 800 pixel.
height : int, optional
    Snapshot image height. Default is ``450`` which takes Desktop size or 450 pixel.

Returns
-------
:class:`report_standard.Standard`
    ``True`` when successful, ``False`` when failed.

References
----------
>>> oModule.CreateReport
````

## PostProcessor3D.available_report_solutions

类型：`method`

```text
PostProcessor3D.available_report_solutions(self, report_category: 'str' = None) -> 'list'
```

源码：`ansys/aedt/core/generic/general_methods.py:620`
源码文件 SHA-256：`1f7b7af67ebd4f6c2ae954cf2cf9e9ecf4a6371769d6845abd31a32ab1fc24fc`

````text
Get the list of available solutions that can be used for the reports.

This list differs from the one obtained with ``app.existing_analysis_sweeps``,
because it includes additional elements like "AdaptivePass".

Parameters
----------
report_category : str, optional
    Report Category. Default is ``None`` which takes default category.

Returns
-------
list

References
----------
>>> oModule.GetAvailableSolutions
````

## PostProcessor3D.available_report_quantities

类型：`method`

```text
PostProcessor3D.available_report_quantities(self, report_category: 'str' = None, display_type: 'str' = None, solution: 'str' = None, quantities_category: 'str' = None, context: 'str | dict' = None, is_siwave_dc: 'bool' = False, differential_pairs: 'bool' = False) -> 'list'
```

源码：`ansys/aedt/core/generic/general_methods.py:349`
源码文件 SHA-256：`1f7b7af67ebd4f6c2ae954cf2cf9e9ecf4a6371769d6845abd31a32ab1fc24fc`

````text
Compute the list of all available report quantities of a given report quantity category.

Parameters
----------
report_category : str, optional
    Report Category. The default is ``None``, in which case the default category is used.
display_type : str, optional
    Report Display Type.
    The default is ``None``, in which case the default type is used.
    In most of the cases the default type is "Rectangular Plot".
solution : str, optional
    Report Setup.
    The default is ``None``, in which case the first nominal adaptive solution is used.
quantities_category : str, optional
    The category that the quantities belong to.
    It must be one of the ``available_quantities_categories`` method.
    The default is ``None``, in which case the first default quantity is used.
context : str, dict, optional
    Report Context.
    The default is ``None``, in which case the default context is used.
    For Maxwell 2D/3D Eddy Current solution types this can be provided as a dictionary
    where the key is the matrix name and value the reduced matrix.
is_siwave_dc : bool, optional
    Whether if the setup is SIwave DCIR or not. Default is ``False``.
differential_pairs : bool, optional
    Whether if return differential pairs traces or not. Default is ``False``.

Returns
-------
list

References
----------
>>> oModule.GetAllQuantities
````

## PostProcessor3D.available_quantities_categories

类型：`method`

```text
PostProcessor3D.available_quantities_categories(self, report_category: 'str' = None, display_type: 'str' = None, solution: 'str' = None, context: 'str | dict' = None, is_siwave_dc: 'bool' = False) -> 'list'
```

源码：`ansys/aedt/core/generic/general_methods.py:261`
源码文件 SHA-256：`1f7b7af67ebd4f6c2ae954cf2cf9e9ecf4a6371769d6845abd31a32ab1fc24fc`

````text
Compute the list of all available report categories.

Parameters
----------
report_category : str, optional
    Report category. The default is ``None``, in which case the first default category is used.
display_type : str, optional
    Report display type. The default is ``None``, in which case the first default type
     is used. In most cases, this default type is ``"Rectangular Plot"``.
solution : str, optional
    Report setup. The default is ``None``, in which case the first
    nominal adaptive solution is used.
context : str, dict, optional
    Report category. The default is ``None``, in which case the first default context
    is used. For Maxwell 2D/3D eddy current solution types, the report category
    can be provided as a dictionary, where the key is the matrix name and the value
    the reduced matrix.
is_siwave_dc : bool, optional
    Whether the setup is SIwave DCIR. The default is ``False``.

Returns
-------
list

References
----------
>>> oModule.GetAllCategories
````

## PostProcessor3D.export_report_to_csv

类型：`method`

```text
PostProcessor3D.export_report_to_csv(self, project_dir: 'str', plot_name: 'str', uniform: 'bool' = False, start: 'str' = None, end: 'str' = None, step: 'str' = None, use_trace_number_format: 'bool' = False) -> 'str'
```

源码：`ansys/aedt/core/generic/general_methods.py:1130`
源码文件 SHA-256：`1f7b7af67ebd4f6c2ae954cf2cf9e9ecf4a6371769d6845abd31a32ab1fc24fc`

````text
Export the 2D Plot data to a CSV file.

This method leaves the data in the plot (as data) as a reference
for the Plot after the loops.

Parameters
----------
project_dir : str
    Path to the project directory. The CSV file is plot_name.csv.
plot_name : str
    Name of the plot to export.
uniform : bool, optional
    Whether the export uniform points to the file. The
    default is ``False``.
start : str, optional
    Start range with units for the sweep if the ``uniform`` parameter
    is set to ``True``.
end : str, optional
    End range with units for the sweep if the ``uniform`` parameter
    is set to ``True``.
step : str, optional
    Step range with units for the sweep if the ``uniform`` parameter is
    set to ``True``.
use_trace_number_format : bool, optional
    Whether to use trace number formats. The default is ``False``.

Returns
-------
str
    Path of exported file.

References
----------
>>> oModule.ExportReportDataToFile
>>> oModule.ExportToFile
>>> oModule.ExportUniformPointsToFile
````

## PostProcessor3D.export_report_to_file

类型：`method`

```text
PostProcessor3D.export_report_to_file(self, output_dir: 'str', plot_name: 'str', extension: 'str', unique_file: 'bool' = False, uniform: 'bool' = False, start: 'str' = None, end: 'str' = None, step: 'str' = None, use_trace_number_format: 'bool' = False) -> 'str'
```

源码：`ansys/aedt/core/generic/general_methods.py:1038`
源码文件 SHA-256：`1f7b7af67ebd4f6c2ae954cf2cf9e9ecf4a6371769d6845abd31a32ab1fc24fc`

````text
Export a 2D Plot data to a file.

This method leaves the data in the plot (as data) as a reference
for the Plot after the loops.

Parameters
----------
output_dir : str
    Path to the directory of exported report
plot_name : str
    Name of the plot to export.
extension : str
    Extension of export , one of
        * (CSV) .csv
        * (Tab delimited) .tab
        * (Post processor format) .txt
        * (Ensight XY data) .exy
        * (Anosft Plot Data) .dat
        * (Ansoft Report Data Files) .rdat
unique_file : bool
    If set to True, generates unique file in output_dit
uniform : bool, optional
    Whether the export uniform points to the file. The
    default is ``False``.
start : str, optional
    Start range with units for the sweep if the ``uniform`` parameter
    is set to ``True``.
end : str, optional
    End range with units for the sweep if the ``uniform`` parameter
    is set to ``True``.
step : str, optional
    Step range with units for the sweep if the ``uniform`` parameter is
    set to ``True``.
use_trace_number_format : bool, optional
    Whether to use trace number formats and use separate columns for curve. The default is ``False``.

Returns
-------
str
    Path of exported file.

References
----------
>>> oModule.ExportReportDataToFile
>>> oModule.ExportUniformPointsToFile
>>> oModule.ExportToFile
````

## PostProcessor3D.export_report_to_jpg

类型：`method`

```text
PostProcessor3D.export_report_to_jpg(self, project_path: 'str', plot_name: 'str', width: 'int' = 800, height: 'int' = 450, image_format: 'str' = 'jpg') -> 'bool'
```

源码：`ansys/aedt/core/generic/general_methods.py:1196`
源码文件 SHA-256：`1f7b7af67ebd4f6c2ae954cf2cf9e9ecf4a6371769d6845abd31a32ab1fc24fc`

````text
Export plot to an image file.

Parameters
----------
project_path : str
    Path to the project directory or full path to the file.
plot_name : str
    Name of the plot to export.
width : int, optional
    Image width. Default is ``800`` which takes Desktop size or 800 pixel.
height : int, optional
    Image height. Default is ``450`` which takes Desktop size or 450 pixel.
image_format : str, optional
    Format of the image file. The default is ``"jpg"``.

Returns
-------
bool
    ``True`` when successful, ``False`` when failed.

References
----------
>>> oModule.ExportImageToFile
````

## PostProcessor3D.create_report_from_configuration

类型：`method`

```text
PostProcessor3D.create_report_from_configuration(self, input_file: 'str' = None, report_settings: 'dict' = None, solution_name: 'str' = None, name: 'str' = None, matplotlib: 'bool' = False, show: 'bool' = True, hide_legend: 'bool' = False, snapshot_path: 'str' = None, width: 'int' = 800, height: 'int' = 450) -> 'Standard | AMIEyeDiagram | AMIConturEyeDiagram | EMIReceiver | EyeDiagram | CircuitNetlistReport | Fields | FarField | NearField | Spectral | ReportPlotter | None | bool'
```

源码：`ansys/aedt/core/generic/general_methods.py:2020`
源码文件 SHA-256：`1f7b7af67ebd4f6c2ae954cf2cf9e9ecf4a6371769d6845abd31a32ab1fc24fc`

````text
Create a report based on a JSON file, TOML file, RPT file, or dictionary of properties.

Parameters
----------
input_file : str, optional
    Path to the JSON, TOML, or RPT file containing report settings.
report_settings : dict, optional
    Dictionary containing report settings.
solution_name : str, optional
    Setup name to use.
name : str, optional
    Report name. The default is ``None``, in which case the
    default name is used.
matplotlib : bool, optional
    Whether to use AEDT or ReportPlotter to generate the plot. Eye diagrams are not supported.
show : bool, optional
    Whether to show the plot when using ReportPlotter. The default is ``True``.
    If matplotlib is ``False``, this parameter is ignored.
hide_legend : bool, optional
    Whether to hide the legend when using AEDT reporter. The default is ``False``.
snapshot_path : str, optional
    Full path to image file if a snapshot is needed.
    The default is ``None``.
width : int, optional
    Image width. Default is ``800`` which takes Desktop size or 800 pixel.
height : int, optional
    Image height. Default is ``450`` which takes Desktop size or 450 pixel.

Returns
-------
:class:`ansys.aedt.core.modules.report_templates.Standard` or None
    Report object if succeeded.
````

## PostProcessor3D.delete_report

类型：`method`

```text
PostProcessor3D.delete_report(self, plot_name: 'str' = None) -> 'bool'
```

源码：`ansys/aedt/core/generic/general_methods.py:863`
源码文件 SHA-256：`1f7b7af67ebd4f6c2ae954cf2cf9e9ecf4a6371769d6845abd31a32ab1fc24fc`

````text
Delete all reports or specific report.

Parameters
----------
plot_name : str, optional
    Name of the plot to delete. The default  value is ``None`` and in this case, all reports are deleted.

Returns
-------
bool
    ``True`` when successful, ``False`` when failed.

References
----------
>>> oModule.DeleteReports
````

## PostProcessor3D.all_report_names

类型：`property`

源码：`ansys/aedt/core/visualization/post/common.py:786`
源码文件 SHA-256：`dbc32a76815e61f1424680f228e5ec9518cafbd44cba628688aa396e7af55a5b`

````text
List of all report names.

Returns
-------
list

References
----------
>>> oModule.GetAllReportNames()
````

## PostProcessor3D.available_report_types

类型：`property`

源码：`ansys/aedt/core/visualization/post/common.py:178`
源码文件 SHA-256：`dbc32a76815e61f1424680f228e5ec9518cafbd44cba628688aa396e7af55a5b`

````text
Report types.

References
----------
>>> oModule.GetAvailableReportTypes
````

## PostProcessor3D.create_fieldplot_surface

类型：`method`

```text
PostProcessor3D.create_fieldplot_surface(self, assignment: 'str | list[str] | list[FacePrimitive]', quantity: 'str', setup: 'str' = None, intrinsics: 'str | dict[str, str]' = None, plot_name: 'str' = None, field_type: 'str' = 'DC R/L Fields') -> 'FieldPlot'
```

源码：`ansys/aedt/core/generic/general_methods.py:1136`
源码文件 SHA-256：`1f7b7af67ebd4f6c2ae954cf2cf9e9ecf4a6371769d6845abd31a32ab1fc24fc`

````text
Create a field plot of surfaces.

Parameters
----------
assignment : list
    List of surfaces to plot.
quantity : str
    Name of the quantity to plot.
setup : str, optional
    Name of the setup. The default is ``None``, in which case the ``nominal_adaptive``
    setup is used. Be sure to build a setup string in the form of
    ``"SetupName : SetupSweep"``, where ``SetupSweep`` is the sweep name to
    use in the export or ``LastAdaptive``.
intrinsics : dict, str, optional
    Intrinsic variables required to compute the field before the export.
    These are typically: frequency, time and phase.
    It can be provided either as a dictionary or as a string.
    If it is a dictionary, keys depend on the solution type and can be expressed in lower or camel case as:
    - ``"Freq"`` or ``"Frequency"``.
    - ``"Time"``.
    - ``"Phase"``.
    If it is a string, it can either be ``"Freq"`` or ``"Time"`` depending on the solution type.
    The default is ``None`` in which case the intrinsics value is automatically computed based on the setup.
plot_name : str, optional
    Name of the field plot to create.
field_type : str, optional
    Field type to plot. Valid only for Q3D Field plots.

Returns
-------
:class:``ansys.aedt.core.modules.solutions.FieldPlot``
    Plot object.

References
----------
>>> oModule.CreateFieldPlot
````

## PostProcessor3D.create_fieldplot_volume

类型：`method`

```text
PostProcessor3D.create_fieldplot_volume(self, assignment: 'str | list[str]', quantity: 'str', setup: 'str' = None, intrinsics: 'str | dict[str, str]' = None, plot_name: 'str' = None, field_type: 'str' = 'DC R/L Fields') -> 'FieldPlot'
```

源码：`ansys/aedt/core/generic/general_methods.py:1295`
源码文件 SHA-256：`1f7b7af67ebd4f6c2ae954cf2cf9e9ecf4a6371769d6845abd31a32ab1fc24fc`

````text
Create a field plot of volumes.

Parameters
----------
assignment : list
    List of volumes to plot.
quantity :
    Name of the quantity to plot.
setup : str, optional
    Name of the setup. The default is ``None``, in which case the ``nominal_adaptive``
    setup is used. Be sure to build a setup string in the form of
    ``"SetupName : SetupSweep"``, where ``SetupSweep`` is the sweep name to
    use in the export or ``LastAdaptive``.
intrinsics : dict, str, optional
    Intrinsic variables required to compute the field before the export.
    These are typically: frequency, time and phase.
    It can be provided either as a dictionary or as a string.
    If it is a dictionary, keys depend on the solution type and can be expressed in lower or camel case as:
    - ``"Freq"`` or ``"Frequency"``.
    - ``"Time"``.
    - ``"Phase"``.
    If it is a string, it can either be ``"Freq"`` or ``"Time"`` depending on the solution type.
    The default is ``None`` in which case the intrinsics value is automatically computed based on the setup.
plot_name : str, optional
    Name of the field plot to create.

Returns
-------
:class:``ansys.aedt.core.modules.solutions.FieldPlot``
    Plot object.

References
----------
>>> oModule.CreateFieldPlot
````

## PostProcessor3D.create_fieldplot_cutplane

类型：`method`

```text
PostProcessor3D.create_fieldplot_cutplane(self, assignment: 'str | list[str]', quantity: 'str', setup: 'str' = None, intrinsics: 'str | dict[str, str]' = None, plot_name: 'str' = None, filter_objects: 'list[str]' = None, field_type: 'str' = 'DC R/L Fields') -> 'FieldPlot'
```

源码：`ansys/aedt/core/generic/general_methods.py:1205`
源码文件 SHA-256：`1f7b7af67ebd4f6c2ae954cf2cf9e9ecf4a6371769d6845abd31a32ab1fc24fc`

````text
Create a field plot of cut planes.

Parameters
----------
assignment : list
    List of cut planes to plot.
quantity : str
    Name of the quantity to plot.
setup : str, optional
    Name of the setup. The default is ``None``, in which case the ``nominal_adaptive`` setup
    is used. Be sure to build a setup string in the form of ``"SetupName : SetupSweep"``,
    where ``SetupSweep`` is the sweep name to use in the export or ``LastAdaptive``.
intrinsics : dict, str, optional
    Intrinsic variables required to compute the field before the export.
    These are typically: frequency, time and phase.
    It can be provided either as a dictionary or as a string.
    If it is a dictionary, keys depend on the solution type and can be expressed in lower or camel case as:

    - ``"Freq"`` or ``"Frequency"``.
    - ``"Time"``.
    - ``"Phase"``.

    If it is a string, it can either be ``"Freq"`` or ``"Time"`` depending on the solution type.
    The default is ``None`` in which case the intrinsics value is automatically computed based on the setup.
plot_name : str, optional
    Name of the field plot to create.
filter_objects : list, optional
    Objects list on which filter the plot.
    The default value is ``None``, in which case an empty list is passed.
field_type : str, optional
    Field type to plot. This parameter is valid only for Q3D field plots.

Returns
-------
:class:``ansys.aedt.core.modules.solutions.FieldPlot``
    Plot object.

References
----------
>>> oModule.CreateFieldPlot
````

## PostProcessor3D.export_field_file

类型：`method`

```text
PostProcessor3D.export_field_file(self, quantity: 'str', solution: 'str' = None, variations: 'dict[str, Any]' = None, output_file: 'str' = None, assignment: 'str' = 'AllObjects', objects_type: 'str' = 'Vol', intrinsics: 'str | dict[str, str]' = None, sample_points_file: 'str' = None, sample_points: 'list[list[float]]' = None, export_with_sample_points: 'bool' = True, reference_coordinate_system: 'str' = 'Global', export_in_si_system: 'bool' = True, export_field_in_reference: 'bool' = True) -> 'bool'
```

源码：`ansys/aedt/core/generic/general_methods.py:757`
源码文件 SHA-256：`1f7b7af67ebd4f6c2ae954cf2cf9e9ecf4a6371769d6845abd31a32ab1fc24fc`

````text
Use the field calculator to create a field file based on a solution and variation.

Parameters
----------
quantity : str
    Name of the quantity to export. For example, ``"Temp"``.
solution : str, optional
    Name of the solution in the format ``"solution: sweep"``.
    The default is ``None``.
variations : dict, optional
    Dictionary of all variation variables with their values.
    The default is ``None``.
output_file : str, optional
    Full path and name to save the file to.
    The default is ``None`` which export a file named ``"<setup_name>.fld"`` in working_directory.
assignment : str, optional
    List of objects to export. The default is ``"AllObjects"``.
objects_type : str, optional
    Type of objects to export. The default is ``"Vol"``.
    Options are ``"Surf"`` for surface and ``"Vol"`` for
    volume.
intrinsics : dict, str, optional
    Intrinsic variables required to compute the field before the export.
    These are typically: frequency, time and phase.
    It can be provided either as a dictionary or as a string.
    If it is a dictionary, keys depend on the solution type and can be expressed in lower or camel case as:
    - ``"Freq"`` or ``"Frequency"``
    - ``"Time"``
    - ``"Phase"``
    If it is a string, it can either be ``"Freq"`` or ``"Time"`` depending on the solution type.
    The default is ``None`` in which case the intrinsics value is automatically computed based on the setup.
sample_points_file : str, optional
    Name of the file with sample points. The default is ``None``.
sample_points : list, optional
    List of the sample points. The default is ``None``.
export_with_sample_points : bool, optional
    Whether to include the sample points in the file to export.
    The default is ``True``.
reference_coordinate_system : str, optional
    Reference coordinate system in the file to export.
    The default is ``"Global"``.
export_in_si_system : bool, optional
    Whether the provided sample points are defined in the SI system or model units.
    The default is ``True``.
export_field_in_reference : bool, optional
    Whether to export the field in reference coordinate system.
    The default is ``True``.

Returns
-------
bool
    ``True`` when successful, ``False`` when failed.

References
----------
>>> oModule.EnterQty
>>> oModule.CopyNamedExprToStack
>>> oModule.CalcOp
>>> oModule.EnterQty
>>> oModule.EnterVol
>>> oModule.CalculatorWrite
>>> oModule.ExportToFile
````

## PostProcessor3D.export_field_file_on_grid

类型：`method`

```text
PostProcessor3D.export_field_file_on_grid(self, quantity: 'str', solution: 'str' = None, variations: 'dict[str, Any]' = None, file_name: 'str' = None, grid_type: 'str' = 'Cartesian', grid_center: 'list[float]' = None, grid_start: 'list[float]' = None, grid_stop: 'list[float]' = None, grid_step: 'list[float]' = None, is_vector: 'bool' = False, intrinsics: 'str | dict[str, str]' = None, export_with_sample_points: 'bool' = True, reference_coordinate_system: 'str' = 'Global', export_in_si_system: 'bool' = True, export_field_in_reference: 'bool' = True) -> 'str | bool'
```

源码：`ansys/aedt/core/generic/general_methods.py:572`
源码文件 SHA-256：`1f7b7af67ebd4f6c2ae954cf2cf9e9ecf4a6371769d6845abd31a32ab1fc24fc`

````text
Use the field calculator to create a field file on a grid based on a solution and variation.

Parameters
----------
quantity : str
    Name of the quantity to export. For example, ``"Temp"``.
solution : str, optional
    Name of the solution in the format ``"solution : sweep"``. The default is ``None``.
variations : dict, optional
    Dictionary of all variation variables with their values.
    The default is ``None``.
file_name : str, optional
    Full path and name to save the file to.
    The default is ``None``, in which case the file is exported
    to the working directory.
grid_type : str, optional
    Type of the grid to export. The default is ``"Cartesian"``.
grid_center : list, optional
    The ``[x, y, z]`` coordinates for the center of the grid.
    The default is ``[0, 0, 0]``. This parameter is disabled if ``gridtype=
    "Cartesian"``.
grid_start : list, optional
    The ``[x, y, z]`` coordinates for the starting point of the grid.
    The default is ``[0, 0, 0]``.
grid_stop : list, optional
    The ``[x, y, z]`` coordinates for the stopping point of the grid.
    The default is ``[0, 0, 0]``.
grid_step : list, optional
    The ``[x, y, z]`` coordinates for the step size of the grid.
    The default is ``[0, 0, 0]``.
is_vector : bool, optional
    Whether the quantity is a vector. The  default is ``False``.
intrinsics : dict, str, optional
    Intrinsic variables required to compute the field before the export.
    These are typically: frequency, time and phase.
    It can be provided either as a dictionary or as a string.
    If it is a dictionary, keys depend on the solution type and can be expressed in lower or camel case as:
    - ``"Freq"`` or ``"Frequency"``.
    - ``"Time"``.
    - ``"Phase"``.
    If it is a string, it can either be ``"Freq"`` or ``"Time"`` depending on the solution type.
    The default is ``None`` in which case the intrinsics value is automatically computed based on the setup.
export_with_sample_points : bool, optional
    Whether to include the sample points in the file to export.
    The default is ``True``.
reference_coordinate_system : str, optional
    Reference coordinate system in the file to export.
    The default is ``"Global"``.
export_in_si_system : bool, optional
    Whether the provided sample points are defined in the SI system or model units.
    The default is ``True``.
export_field_in_reference : bool, optional
    Whether to export the field in reference coordinate system.
    The default is ``True``.

Returns
-------
str
    Field file path when succeeded.

References
----------
>>> oModule.EnterQty
>>> oModule.CopyNamedExprToStack
>>> oModule.CalcOp
>>> oModule.EnterQty
>>> oModule.EnterVol
>>> oModule.ExportOnGrid
````

## PostProcessor3D.export_field_jpg

类型：`method`

```text
PostProcessor3D.export_field_jpg(self, file_name: 'str', plot_name: 'str', folder_name: 'str', orientation: 'str' = 'isometric', width: 'int' = 1920, height: 'int' = 1080, display_wireframe: 'bool' = True, selections: 'list[str]' = None, show_axis: 'bool' = True, show_grid: 'bool' = True, show_ruler: 'bool' = True, show_region: 'str' = 'Default') -> 'bool'
```

源码：`ansys/aedt/core/generic/general_methods.py:1373`
源码文件 SHA-256：`1f7b7af67ebd4f6c2ae954cf2cf9e9ecf4a6371769d6845abd31a32ab1fc24fc`

````text
Export a field plot and coordinate system to a JPG file.

Parameters
----------
file_name : str
    Full path and name to save the JPG file to.
plot_name : str
    Name of the plot.
folder_name : str
    Name of the folder plot.
orientation : str, optional
    Name of the orientation to apply. The default is ``"isometric"``.
width : int, optional
    Plot Width. The default is ``1920``.
height : int, optional
    Plot Height. The default is ``1080``.
display_wireframe : bool, optional
    Display wireframe. The default is ``True``.
selections : list, optional
    List of objects to include in the plot.
     Supported in 3D Field Plots only starting from 23R1.
show_axis : bool, optional
    Whether to show the axes. The default is ``True``.
    Supported in 3D Field Plots only starting from 23R1.
show_grid : bool, optional
    Whether to show the grid. The default is ``True``.
    Supported in 3D Field Plots only starting from 23R1.
show_ruler : bool, optional
    Whether to show the ruler. The default is ``True``.
    Supported in 3D Field Plots only starting from 23R1.
show_region : bool, optional
    Whether to show the region or not. The default is ``Default``.
    Supported in 3D Field Plots only starting from 23R1.

Returns
-------
bool
    ``True`` when successful, ``False`` when failed.

References
----------
>>> oModule.ExportPlotImageToFile
>>> oModule.ExportModelImageToFile
````

## PostProcessor3D.get_scalar_field_value

类型：`method`

```text
PostProcessor3D.get_scalar_field_value(self, quantity: 'str', scalar_function: 'str' = 'Maximum', solution: 'str' = None, variations: 'dict[str, Any]' = None, is_vector: 'bool' = False, intrinsics: 'str | dict[str, str]' = None, object_name: 'str' = 'AllObjects', object_type: 'str' = 'volume', adjacent_side: 'bool' = False) -> 'float'
```

源码：`ansys/aedt/core/generic/general_methods.py:429`
源码文件 SHA-256：`1f7b7af67ebd4f6c2ae954cf2cf9e9ecf4a6371769d6845abd31a32ab1fc24fc`

````text
Use the field calculator to Compute Scalar of a Field.

Parameters
----------
quantity : str
    Name of the quantity to export. For example, ``"Temp"``.
scalar_function : str, optional
    The name of the scalar function. For example, ``"Maximum"``, ``"Integrate"``.
    The default is ``"Maximum"``.
solution : str, optional
    Name of the solution in the format ``"solution : sweep"``. The default is ``None``.
variations : dict, optional
    Dictionary of all variation variables with their values.
    e.g. ``['power_block:=', ['0.6W'], 'power_source:=', ['0.15W']]``
    The default is ``None``.
is_vector : bool, optional
    Whether the quantity is a vector. The  default is ``False``.
intrinsics : dict, str, optional
    Intrinsic variables required to compute the field before the export.
    These are typically: frequency, time and phase.
    It can be provided either as a dictionary or as a string.

    If it is a dictionary, keys depend on the solution type and can be expressed as:
    - ``"Freq"`` or ``"Frequency"``.
    - ``"Time"``.
    - ``"Phase"``.

    If it is a string, it can either be ``"Freq"`` or ``"Time"`` depending on the solution type.
    The default is ``None`` in which case the intrinsics value is automatically computed based on the setup.
object_name : str, optional
    Name of the object. For example, ``"Box1"``.
    The default is ``"AllObjects"``.
object_type : str, optional
    Type of the object - ``"volume"``, ``"surface"``, ``"point"``.
    The default is ``"volume"``.
adjacent_side : bool, optional
    To query quantity value on adjacent side for object_type = "surface", pass ``True``.
    The default is ``False``.

Returns
-------
float
    Scalar field value.

References
----------
>>> oModule.EnterQty
>>> oModule.CopyNamedExprToStack
>>> oModule.CalcOp
>>> oModule.EnterQty
>>> oModule.EnterVol
>>> oModule.ClcEval
>>> GetTopEntryValue
````

## Reports.standard

类型：`method`

```text
Reports.standard(self, expressions: 'str | list' = None, setup: 'str' = None) -> 'Standard'
```

源码：`ansys/aedt/core/generic/general_methods.py:2532`
源码文件 SHA-256：`1f7b7af67ebd4f6c2ae954cf2cf9e9ecf4a6371769d6845abd31a32ab1fc24fc`

````text
Create a standard or default report object.

Parameters
----------
expressions : str or list
    Expression List to add into the report. The expression can be any of the available formula
    you can enter into the Electronics Desktop Report Editor.
setup : str, optional
    Name of the setup. The default is ``None``, in which case the ``nominal_adaptive``
    setup is used. Be sure to build a setup string in the form of
    ``"SetupName : SetupSweep"``, where ``SetupSweep`` is the sweep name to
    use in the export or ``LastAdaptive``.

Returns
-------
:class:`ansys.aedt.core.modules.report_templates.Standard`
````

## Reports.modal_solution

类型：`method`

```text
Reports.modal_solution(self, expressions: 'str | list' = None, setup: 'str | None' = None) -> 'Standard'
```

源码：`ansys/aedt/core/generic/general_methods.py:2910`
源码文件 SHA-256：`1f7b7af67ebd4f6c2ae954cf2cf9e9ecf4a6371769d6845abd31a32ab1fc24fc`

````text
Create a Standard or Default Report object.

Parameters
----------
expressions : str or list
    Expression List to add into the report. The expression can be any of the available formula
    you can enter into the Electronics Desktop Report Editor.
setup : str, optional
    Name of the setup. The default is ``None``, in which case the ``nominal_adaptive``
    setup is used. Be sure to build a setup string in the form of
    ``"SetupName : SetupSweep"``, where ``SetupSweep`` is the sweep name to
    use in the export or ``LastAdaptive``.

Returns
-------
:class:`ansys.aedt.core.modules.report_templates.Standard`
````

## Reports.terminal_solution

类型：`method`

```text
Reports.terminal_solution(self, expressions: 'str | list' = None, setup: 'str | None' = None) -> 'Standard'
```

源码：`ansys/aedt/core/generic/general_methods.py:2946`
源码文件 SHA-256：`1f7b7af67ebd4f6c2ae954cf2cf9e9ecf4a6371769d6845abd31a32ab1fc24fc`

````text
Create a Standard or Default Report object.

Parameters
----------
expressions : str or list
    Expression List to add into the report. The expression can be any of the available formula
    you can enter into the Electronics Desktop Report Editor.
setup : str, optional
    Name of the setup. The default is ``None``, in which case the ``nominal_adaptive``
    setup is used. Be sure to build a setup string in the form of
    ``"SetupName : SetupSweep"``, where ``SetupSweep`` is the sweep name to
    use in the export or ``LastAdaptive``.

Returns
-------
:class:`ansys.aedt.core.modules.report_templates.Standard`
````

## Reports.far_field

类型：`method`

```text
Reports.far_field(self, expressions: 'str | list' = None, setup: 'str | None' = None, sphere_name: 'str' = None, source_context: 'str' = None, **variations) -> 'FarField'
```

源码：`ansys/aedt/core/generic/general_methods.py:2775`
源码文件 SHA-256：`1f7b7af67ebd4f6c2ae954cf2cf9e9ecf4a6371769d6845abd31a32ab1fc24fc`

````text
Create a Far Field Report object.

Parameters
----------
expressions : str or list
    Expression List to add into the report. The expression can be any of the available formula
    you can enter into the Electronics Desktop Report Editor.
setup : str, optional
    Name of the setup. The default is ``None``, in which case the ``nominal_adaptive``
    setup is used. Be sure to build a setup string in the form of
    ``"SetupName : SetupSweep"``, where ``SetupSweep`` is the sweep name to
    use in the export or ``LastAdaptive``.
sphere_name : str, optional
    Name of the sphere to create the far field on.
source_context : str, optional
    Name of the active source to create the far field on.

Returns
-------
:class:`ansys.aedt.core.modules.report_templates.FarField`
````

## SolutionData.get_expression_data

类型：`method`

```text
SolutionData.get_expression_data(self, expression: str = None, formula: str = 'real', convert_to_SI: bool = False, use_quantity: bool = False, sweeps: list | str = None) -> tuple[numpy.ndarray, numpy.ndarray]
```

源码：`ansys/aedt/core/generic/general_methods.py:648`
源码文件 SHA-256：`1f7b7af67ebd4f6c2ae954cf2cf9e9ecf4a6371769d6845abd31a32ab1fc24fc`

````text
Retrieve the real part of the data for an expression.

Parameters
----------
expression : str, None
    Name of the expression. The default is ``None``,
    in which case the active expression is used.
formula : str, optional
    Data type to be retrieved. Default is ``real``. Options are ``real``, ``imag``, ``mag``, ``magnitude``,
    ``db10``, ``db20``, ``phase``, ``phaserad``.
convert_to_SI : bool, optional
    Whether to convert the data to the SI unit system.
    The default is ``False``.
use_quantity : bool, optional
    Whether to output data in ``Quantity`` format or not.
    It impacts on performances as it returns array of objects.
sweeps : list, str, optional
    List of sweeps to consider for the data retrieval.
    The default is ``None``, which actually takes the primary sweep.

Returns
-------
(np.array, np.array)
    X and Y data for the expression.
````

## SolutionData.export_data_to_csv

类型：`method`

```text
SolutionData.export_data_to_csv(self, output: str, delimiter: str = ';') -> bool
```

源码：`ansys/aedt/core/generic/general_methods.py:790`
源码文件 SHA-256：`1f7b7af67ebd4f6c2ae954cf2cf9e9ecf4a6371769d6845abd31a32ab1fc24fc`

````text
Save to output csv file the Solution Data.

Parameters
----------
output : str,
    Full path to csv file.
delimiter : str,
    CSV Delimiter. Default is ``";"``.

Returns
-------
bool
    ``True`` when successful, ``False`` when failed.
````

## SolutionData.plot

类型：`method`

```text
SolutionData.plot(self, curves: list | str = None, formula: str = None, size: tuple = (1920, 1440), show_legend: bool = True, x_label: str = '', y_label: str = '', title: str = '', snapshot_path: str = None, is_polar: bool = False, show: bool = True) -> 'ReportPlotter'
```

源码：`ansys/aedt/core/generic/general_methods.py:907`
源码文件 SHA-256：`1f7b7af67ebd4f6c2ae954cf2cf9e9ecf4a6371769d6845abd31a32ab1fc24fc`

````text
Create a matplotlib figure based on a list of data.

Parameters
----------
curves : list
    Curves to be plotted. The default is ``None``, in which case
    the first curve is plotted.
formula : str , optional
    Mathematical formula to apply to the plot curve. The default is ``None``,
    in which case only real value of the data stored in the solution data is plotted.
    Options are ``"abs"``, ``"db10"``, ``"db20"``, ``"im"``, ``"mag"``, ``"phasedeg"``,
    ``"phaserad"``, and ``"re"``.
size : tuple, optional
    Image size in pixels (width, height).
show_legend : bool
    Whether to show the legend. The default is ``True``.
    This parameter is ignored if the number of curves to plot is
    greater than 15.
x_label : str
    Plot X label.
y_label : str
    Plot Y label.
title : str
    Plot title label.
snapshot_path : str
    Full path to image file if a snapshot is needed.
is_polar : bool, optional
    Set to `True` if this is a polar plot.
show : bool, optional
    Whether if show the plot or not. Default is set to `True`.

Returns
-------
:class:`ansys.aedt.core.visualization.plot.matplotlib.ReportPlotter`
    Matplotlib class object.
````

## SolutionData.set_active_variation

类型：`method`

```text
SolutionData.set_active_variation(self, var_id: int = 0) -> bool
```

源码：`ansys/aedt/core/generic/general_methods.py:141`
源码文件 SHA-256：`1f7b7af67ebd4f6c2ae954cf2cf9e9ecf4a6371769d6845abd31a32ab1fc24fc`

````text
Set the active variations to one of available variations in self.variations.

Parameters
----------
var_id : int
    Index of Variations to assign.

Returns
-------
bool
    ``True`` when successful, ``False`` when failed.
````

## SolutionData.primary_sweep

类型：`property`

源码：`ansys/aedt/core/visualization/post/solution_data.py:286`
源码文件 SHA-256：`63e28baf75e3a7f58eb86bf26aa3cfa157a70c15d72efd4857fa46a1ee0c7151`

````text
Primary sweep.

Parameters
----------
ps : float
    Perimeter of the source.
````

## SolutionData.primary_sweep_values

类型：`property`

源码：`ansys/aedt/core/visualization/post/solution_data.py:587`
源码文件 SHA-256：`63e28baf75e3a7f58eb86bf26aa3cfa157a70c15d72efd4857fa46a1ee0c7151`

````text
Retrieve the primary sweep for a given data and primary variable.

Returns
-------
np.array
    List of the primary sweep valid points for the expression.
````

## SolutionData.expressions

类型：`property`

源码：`ansys/aedt/core/visualization/post/solution_data.py:309`
源码文件 SHA-256：`63e28baf75e3a7f58eb86bf26aa3cfa157a70c15d72efd4857fa46a1ee0c7151`

````text
Expressions.
````

## SolutionData.intrinsics

类型：`property`

源码：`ansys/aedt/core/visualization/post/solution_data.py:234`
源码文件 SHA-256：`63e28baf75e3a7f58eb86bf26aa3cfa157a70c15d72efd4857fa46a1ee0c7151`

````text
Get intrinsics dictionary on active variation.
````

## SolutionData.active_variation

类型：`property`

源码：`ansys/aedt/core/visualization/post/solution_data.py:77`
源码文件 SHA-256：`63e28baf75e3a7f58eb86bf26aa3cfa157a70c15d72efd4857fa46a1ee0c7151`

````text
Retrieve active variation.
````

## SolutionData.active_intrinsic

类型：`instance_attribute`

这是实例属性：从对象读取，不加 `()`；静态类查询可能找不到它。

源码：`ansys/aedt/core/visualization/post/solution_data.py:43`
源码文件 SHA-256：`63e28baf75e3a7f58eb86bf26aa3cfa157a70c15d72efd4857fa46a1ee0c7151`


## SolutionData.enable_pandas_output

类型：`property`

源码：`ansys/aedt/core/visualization/post/solution_data.py:98`
源码文件 SHA-256：`63e28baf75e3a7f58eb86bf26aa3cfa157a70c15d72efd4857fa46a1ee0c7151`

````text
Set/Get a flag to use Pandas to export dict and lists.

This applies to Solution data output.
If ``True`` the property or method will return a pandas object in CPython environment.
Default is ``False``.

Returns
-------
bool
````

## SolutionData.units_sweeps

类型：`instance_attribute`

这是实例属性：从对象读取，不加 `()`；静态类查询可能找不到它。

源码：`ansys/aedt/core/visualization/post/solution_data.py:43`
源码文件 SHA-256：`63e28baf75e3a7f58eb86bf26aa3cfa157a70c15d72efd4857fa46a1ee0c7151`


## SolutionData.units_data

类型：`instance_attribute`

这是实例属性：从对象读取，不加 `()`；静态类查询可能找不到它。

源码：`ansys/aedt/core/visualization/post/solution_data.py:43`
源码文件 SHA-256：`63e28baf75e3a7f58eb86bf26aa3cfa157a70c15d72efd4857fa46a1ee0c7151`


## SolutionData.variations

类型：`instance_attribute`

这是实例属性：从对象读取，不加 `()`；静态类查询可能找不到它。

源码：`ansys/aedt/core/visualization/post/solution_data.py:43`
源码文件 SHA-256：`63e28baf75e3a7f58eb86bf26aa3cfa157a70c15d72efd4857fa46a1ee0c7151`


## SolutionData.number_of_variations

类型：`instance_attribute`

这是实例属性：从对象读取，不加 `()`；静态类查询可能找不到它。

源码：`ansys/aedt/core/visualization/post/solution_data.py:43`
源码文件 SHA-256：`63e28baf75e3a7f58eb86bf26aa3cfa157a70c15d72efd4857fa46a1ee0c7151`


## SolutionData.full_matrix_real_imag

类型：`property`

源码：`ansys/aedt/core/visualization/post/solution_data.py:461`
源码文件 SHA-256：`63e28baf75e3a7f58eb86bf26aa3cfa157a70c15d72efd4857fa46a1ee0c7151`

````text
Get the full available solution data in Real and Imaginary parts.

Returns
-------
tuple of dicts
    (Real Dict, Imag Dict)
````

## SolutionData.full_matrix_mag_phase

类型：`property`

源码：`ansys/aedt/core/visualization/post/solution_data.py:479`
源码文件 SHA-256：`63e28baf75e3a7f58eb86bf26aa3cfa157a70c15d72efd4857fa46a1ee0c7151`

````text
Get the full available solution data magnitude and phase in radians.

Returns
-------
tuple of dicts
    (Mag Dict, Phase Dict).
````

## CommonReport.create

类型：`method`

```text
CommonReport.create(self, name: 'str' = None) -> 'bool'
```

源码：`ansys/aedt/core/generic/general_methods.py:1716`
源码文件 SHA-256：`1f7b7af67ebd4f6c2ae954cf2cf9e9ecf4a6371769d6845abd31a32ab1fc24fc`

````text
Create a report.

Parameters
----------
name : str, optional
    Name for the plot. The default is ``None``, in which case the
    default name is used.

Returns
-------
bool
    ``True`` when successful, ``False`` when failed.
````

## CommonReport.get_solution_data

类型：`method`

```text
CommonReport.get_solution_data(self) -> 'SolutionData | bool'
```

源码：`ansys/aedt/core/generic/general_methods.py:2069`
源码文件 SHA-256：`1f7b7af67ebd4f6c2ae954cf2cf9e9ecf4a6371769d6845abd31a32ab1fc24fc`

````text
Get the report solution data.

Returns
-------
:class:`ansys.aedt.core.visualization.post.solution_data.SolutionData` or bool
    Solution data object.
````

## CommonReport.export_config

类型：`method`

```text
CommonReport.export_config(self, output_file: 'str') -> 'bool'
```

源码：`ansys/aedt/core/generic/general_methods.py:2035`
源码文件 SHA-256：`1f7b7af67ebd4f6c2ae954cf2cf9e9ecf4a6371769d6845abd31a32ab1fc24fc`

````text
Generate a configuration file from active report.

Parameters
----------
output_file : str
    Full path to json file.

Returns
-------
bool
    ``True`` when successful, ``False`` when failed.
````

## CommonReport.edit_x_axis_scaling

类型：`method`

```text
CommonReport.edit_x_axis_scaling(self, linear_scaling: 'bool' = True, min_scale: 'str' = None, max_scale: 'str' = None, minor_tick_divs: 'int' = 5, min_spacing: 'str' = None, units: 'str' = None) -> 'bool'
```

源码：`ansys/aedt/core/generic/general_methods.py:2492`
源码文件 SHA-256：`1f7b7af67ebd4f6c2ae954cf2cf9e9ecf4a6371769d6845abd31a32ab1fc24fc`

````text
Edit the X-axis scaling settings.

Parameters
----------
linear_scaling : bool, optional
    Whether to use the linear scale. The default is ``True``.
    When ``False``, the log scale is used.
min_scale : str, optional
    Minimum scale value with units. The default is ``None``.
max_scale : str, optional
    Maximum scale value with units. The default is ``None``.
minor_tick_divs : int, optional
    Minor tick division. The default is ``5``.
min_spacing : str, optional
    Minimum spacing with units. The default is ``None``.
units : str, optional
    Units in the plot. The default is ``None``.

Returns
-------
bool
    ``True`` when successful, ``False`` when failed.
````

## CommonReport.edit_y_axis_scaling

类型：`method`

```text
CommonReport.edit_y_axis_scaling(self, name: 'str' = 'Y1', linear_scaling: 'bool' = True, min_scale: 'str' = None, max_scale: 'str' = None, minor_tick_divs: 'int' = 5, min_spacing: 'str' = None, units: 'str' = None) -> 'bool'
```

源码：`ansys/aedt/core/generic/general_methods.py:2731`
源码文件 SHA-256：`1f7b7af67ebd4f6c2ae954cf2cf9e9ecf4a6371769d6845abd31a32ab1fc24fc`

````text
Edit the Y-axis scaling settings.

Parameters
----------
axis name : str, optional
    Axis name. The default is ``Y``.
linear_scaling : bool, optional
    Whether to use the linear scale. The default is ``True``.
    When ``False``, the log scale is used.
min_scale : str, optional
    Minimum scale value with units. The default is ``None``.
max_scale : str, optional
    Maximum scale value with units. The default is ``None``.
minor_tick_divs : int, optional
    Minor tick division. The default is ``5``.
min_spacing : str, optional
    Minimum spacing with units. The default is ``None``.
units : str, optional
    Units in the plot. The default is ``None``.

Returns
-------
bool
    ``True`` when successful, ``False`` when failed.
````

## CommonReport.add_cartesian_y_marker

类型：`method`

```text
CommonReport.add_cartesian_y_marker(self, value: 'str', name: 'str | None' = None, y_axis: 'int' = 1) -> 'str'
```

源码：`ansys/aedt/core/generic/general_methods.py:2294`
源码文件 SHA-256：`1f7b7af67ebd4f6c2ae954cf2cf9e9ecf4a6371769d6845abd31a32ab1fc24fc`

````text
Add a cartesian Y marker.

.. note::
   This method only works in graphical mode.

Parameters
----------
value : str, float
    Value to apply with units.
name : str, optional
    Marker name. The default is ``None``.
y_axis : str, optional
    Y axis. The default is ``"Y1"``.

Returns
-------
str
    Marker name if created.
````

## SetupHFSS.get_solution_data

类型：`method`

```text
SetupHFSS.get_solution_data(self, expressions: 'str | list' = None, domain: 'str' = None, variations: 'dict' = None, primary_sweep_variable: 'str' = None, report_category: 'str' = None, context: 'str | dict' = None, polyline_points: 'int' = 1001, math_formula: 'str' = None, sweep: 'str' = None) -> "'SolutionData'"
```

源码：`ansys/aedt/core/generic/general_methods.py:460`
源码文件 SHA-256：`1f7b7af67ebd4f6c2ae954cf2cf9e9ecf4a6371769d6845abd31a32ab1fc24fc`

````text
Get a simulation result from a solved setup and cast it in a ``SolutionData`` object.

Data to be retrieved from Electronics Desktop are any simulation results available in that
specific simulation context.
Most of the argument have some defaults which works for most of the ``Standard`` report quantities.

Parameters
----------
expressions : str or list, optional
    One or more formulas to add to the report. Example is value ``"dB(S(1,1))"`` or a list of values.
    Default is `None` which will return all traces.
domain : str, optional
    Plot Domain. Options are "Sweep" for frequency domain related results and "Time" for transient related data.
variations : dict, optional
    Dictionary of all families including the primary sweep.
    The default is ``None`` which will use the nominal variations of the setup.
primary_sweep_variable : str, optional
    Name of the primary sweep. The default is ``"None"`` which, depending on the context,
    will internally assign the primary sweep to:
    1. ``Freq`` for frequency domain results,
    2. ``Time`` for transient results,
    3. ``Theta`` for radiation patterns,
    4. ``distance`` for field plot over a polyline.
report_category : str, optional
    Category of the Report to be created. If `None` default data Report will be used.
    The Report Category can be one of the types available for creating a report depend on the simulation setup.
    For example for a Far Field Plot in HFSS the UI shows the report category as "Create Far Fields Report".
    The report category will be in this case "Far Fields".
    Depending on the setup different categories are available.
    If `None` default category will be used (the first item in the Results drop down menu in AEDT).
    To get the list of available categories user can use method ``available_report_types``.
context : str, dict, optional
    This is the context of the report.
    The default is ``None``. It can be:
    1. `None`
    2. Infinite Sphere name for Far Fields Plot.
    3. Dictionary. If dictionary is passed, key is the report property name and value is property value.
polyline_points : int, optional
    Number of points on which to create the report for plots on polylines.
    This parameter is valid for ``Fields`` plot only.
math_formula : str, optional
    One of the available AEDT mathematical formulas to apply. For example, ``abs, dB``.
sweep : str, optional
    Name of the sweep adaptive setup to get solutions from. the default is ``LastAdaptive``.

Returns
-------
:class:`ansys.aedt.core.visualization.post.solution_data.SolutionData`
    Solution Data object.

References
----------
>>> oModule.GetSolutionDataPerVariation
````

## AnsysReport.__init__

类型：`method`

```text
AnsysReport.__init__(self, version: str = '2026.1', design_name: str = 'design1', project_name: str = 'AnsysProject', template_json_file: str | None = None) -> None
```

源码：`ansys/aedt/core/visualization/plot/pdf.py:304`
源码文件 SHA-256：`00f74df02b60711f0e7222a2d8fffdd5a1e58455c5b61e48090cd84d247a6e86`

````text
Initialize self.  See help(type(self)) for accurate signature.
````

## AnsysReport.create

类型：`method`

```text
AnsysReport.create(self, add_cover_page: bool = True, add_new_section_after: bool = True) -> bool
```

源码：`ansys/aedt/core/visualization/plot/pdf.py:428`
源码文件 SHA-256：`00f74df02b60711f0e7222a2d8fffdd5a1e58455c5b61e48090cd84d247a6e86`

````text
Create a new report using ``report_specs`` properties.
````

## AnsysReport.add_chapter

类型：`method`

```text
AnsysReport.add_chapter(self, chapter_name: str) -> bool
```

源码：`ansys/aedt/core/visualization/plot/pdf.py:454`
源码文件 SHA-256：`00f74df02b60711f0e7222a2d8fffdd5a1e58455c5b61e48090cd84d247a6e86`

````text
Add a new chapter.
````

## AnsysReport.add_sub_chapter

类型：`method`

```text
AnsysReport.add_sub_chapter(self, chapter_name: str) -> bool
```

源码：`ansys/aedt/core/visualization/plot/pdf.py:469`
源码文件 SHA-256：`00f74df02b60711f0e7222a2d8fffdd5a1e58455c5b61e48090cd84d247a6e86`

````text
Add a new sub-chapter.
````

## AnsysReport.add_text

类型：`method`

```text
AnsysReport.add_text(self, content: str, bold: bool = False, italic: bool = False) -> None
```

源码：`ansys/aedt/core/visualization/plot/pdf.py:496`
源码文件 SHA-256：`00f74df02b60711f0e7222a2d8fffdd5a1e58455c5b61e48090cd84d247a6e86`

````text
Add a new text.
````

## AnsysReport.add_image

类型：`method`

```text
AnsysReport.add_image(self, path: str, caption: str = '', width: int = 0, height: int = 0) -> bool
```

源码：`ansys/aedt/core/visualization/plot/pdf.py:512`
源码文件 SHA-256：`00f74df02b60711f0e7222a2d8fffdd5a1e58455c5b61e48090cd84d247a6e86`

````text
Add a new image.
````

## AnsysReport.add_table

类型：`method`

```text
AnsysReport.add_table(self, title: str, content: list[list], formatting: list | None = None, col_widths: list | None = None, full_width: bool = False) -> None
```

源码：`ansys/aedt/core/visualization/plot/pdf.py:540`
源码文件 SHA-256：`00f74df02b60711f0e7222a2d8fffdd5a1e58455c5b61e48090cd84d247a6e86`

````text
Add a new table from a list of data.
````

## AnsysReport.add_chart

类型：`method`

```text
AnsysReport.add_chart(self, x_values: list, y_values: list, x_caption: str, y_caption: str, title: str) -> None
```

源码：`ansys/aedt/core/internal/checks.py:563`
源码文件 SHA-256：`02ea2752296de9c6d4724e30c96eaf1fe23c70d5e9e59c8f10b4f9a6f46dce10`

````text
Add a chart to the report using matplotlib.
````

## AnsysReport.save_pdf

类型：`method`

```text
AnsysReport.save_pdf(self, file_path: str, file_name: str | None = None) -> str
```

源码：`ansys/aedt/core/visualization/plot/pdf.py:1245`
源码文件 SHA-256：`00f74df02b60711f0e7222a2d8fffdd5a1e58455c5b61e48090cd84d247a6e86`

````text
Save pdf.
````

## 旧接口与路径探测

| 名称 | 当前状态 |
| --- | --- |
| `SolutionData.data_real` | missing |
| `SolutionData.data_imag` | missing |
| `SolutionData.data_magnitude` | missing |
| `SolutionData.data_db20` | missing |
| `SolutionData.data_phase` | missing |
| `PostProcessorHFSS.get_antenna_data` | missing |

## 上游源码许可

```text
MIT License

Copyright (c) 2021 - 2026 Synopsys, Inc. and ANSYS, Inc. All rights reserved.

Permission is hereby granted, free of charge, to any person obtaining a copy of
this software and associated documentation files (the "Software"), to deal in
the Software without restriction, including without limitation the rights to
use, copy, modify, merge, publish, distribute, sublicense, and/or sell copies
of the Software, and to permit persons to whom the Software is furnished to do
so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all
copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
SOFTWARE.
```
