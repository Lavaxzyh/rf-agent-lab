# PyAEDT 1.9.0 文档与离线验证记录

核对日期：2026-10-13（Asia/Shanghai）；离线验证记录时间：2026-10-13T04:37:44.300944+00:00。

## 版本与来源

- 最新正式版依据：[PyPI 1.9.0](https://pypi.org/project/pyaedt/1.9.0/)；发布日 2026-10-10。
- 官方文档首页核对版本：[stable 1.9.0](https://aedt.docs.pyansys.com/version/stable/)。
- wheel：`pyaedt-1.9.0-py3-none-any.whl`。
- wheel SHA-256：`2db03d1e4c70c14fed8eb05f91cc68506932c173107c220f901a1a8b1b44cbc8`，与 PyPI 文件信息一致。
- 加载包入口：`[本机环境路径已隐藏]`。
- 发布源码 tag：`v1.9.0`；发布 commit：`5b5b7f59d8835eec15974060f3f658f2fa0ad46b`。

## 已完成检查

- 静态读取 69 个方法/属性，未缺失目标接口。
- 官方文档参数名称、顺序、默认值：27/27 一致。
- 详细官方 URL 与每项参数对照见 `official_doc_check.json`。
- 手册 22 个 Python 代码块通过语法解析；38 次直接/checked_call API 调用通过实际签名绑定。
- 合成结果的实部/虚部提取、dB、频率 Hz 转换、复数 CSV 写入回读通过数值断言。
- 未知参数与不存在的导出文件能够被 helper 拒绝。

## 合成数据与实现差异

测试输入：频率 `[1, 2] GHz`，`S(P1,P1) = [0.3+0.4j, -0.5+0j]`。
数据由 MockAedtData 提供，真实执行发布包的 SolutionData 数组处理；没有 AEDT 会话。

期望相位：弧度 `[0.927295218, 3.141592654]`；角度 `[53.130102354, 180]`。

| 检查 | 实际输出 |
| --- | --- |
| `formula=phase` | `[0.9272952180016123, 3.141592653589793]` |
| `formula=phasedeg` | `[0.9272952180016123, 3.141592653589793]` |
| `formula=phaserad` | `[0.016184354692126725, 0.05483113556160754]` |
| `native CSV header` | `['Freq [GHz]', '\|S(P1', 'P1)\|']` |
| `native CSV rows` | `[['1.0', '0.3'], ['2.0', '-0.5']]` |

`phase`/`phasedeg` 返回相同弧度数值，`phaserad` 再乘 π/180；因此主手册用实部/虚部配合 `np.angle`。
原生 SolutionData CSV 在该复数样本中没有保存虚部列；显式 CSV helper 通过全部列的回读断言。
这些结论限于该发布包和该合成案例，不等于所有真实工程导出场景均已测试。

## 尚未进行的验证

- 未启动/连接 AEDT，未加载或改动 `.aedt` 工程，未求解。
- 未实测 HFSS 原生报告、Touchstone、远场、场图或场文件导出。
- 未实际生成 PDF，未验证 pdf-oxide、中文字体或报告版式。
- 1.9.0 复用本机解释器已有依赖以完成离线检查；这不是完整独立环境部署验证。
- 跨 AEDT 版本的能力仍需按具体功能验证，签名一致不能保证底层功能可用。

## 复验

在安装目标版本的解释器中执行 `python verify_offline.py`；默认不联网、不写验证记录。
维护时使用 `--write-report` 重写本文件；网络对照由 `compare_official_docs.py` 单独执行。
