# 本地案例预览

网站暂定品牌：RF Agent Lab，署名 Lavax。首页定位为 AI × RF 工程工具与研究实践。
原 Paper2HFSS 预告模块保留，当前隐藏；原页面内 hash 路由保留。
GitHub 发布目标：`Lavaxzyh/rf-agent-lab`。
线上网址：`https://lavaxzyh.github.io/rf-agent-lab/`。

本地分支：`codex/case-studies`。修改前基准：`8adc048`（原 `main`）。
此前在本地分支开发，保留分阶段提交；2026-10-12 起按用户要求发布到 GitHub Pages。
2026-10-13 的 Docs 调整在 `codex/docs-pyaedt` 本地分支进行，以 `508dbd9` 为发布基准，等待用户确认后再推送。

## 启动与查看

在仓库目录执行 `npm run dev -- --host 127.0.0.1 --port 4173 --strictPort`。

- Case Studies（02）：`http://127.0.0.1:4173/#cases`
- 完整案例：`http://127.0.0.1:4173/#/cases/qr-grid-patch`
- 构建检查：`npm run build`
- Docs 列表：`http://127.0.0.1:4173/#docs`
- PyAEDT 手册：`http://127.0.0.1:4173/#/docs/pyaedt-postprocessing`

## 栏目上线开关

当前导航顺序：01 MCP → 02 Case Studies → 03 Skills → 04 Visual Lab → 05 Docs。

`src/site-config.ts` 的 `panelVisibility` 控制导航、路由和页面展示。
目前 `paper2hfss` 为 `false`；Docs 为 `true`，只展示真实的 PyAEDT 文档集合。原示例文章源码保留但不展示。
访问已隐藏栏目旧地址会回到首页，首页和案例页不再链接到这些栏目。
后续将对应值改成 `true` 并重新构建即可恢复显示。
Skills 仅展示 Codex Profile Switch；MCP 仅展示置顶的真实 ads-mcp 项目。
其他 MCP 条目保留 `Planned` 状态，`published: false` 隐藏，不出现在页面中。
后续在 `src/App.tsx` 的 MCP 数据中将对应 `published` 改为 `true` 即可展示。

## 内容来源

以课程论文及 2026-08-04 最终工程归档的 CSV 为依据，排除早期 HFSS 模型。
参考曲线来自原论文 Fig. 16 数字化；模型展示来自工程参数，无软件重新求解。
原论文设计和拓扑优化归 Ma 等原作者，本站展示 Lavax 的 AI 辅助复现。
详情页开头与静态结果图均标明引用，链接 DOI 与 IEEE Xplore。
原始论文、课程论文原文件不加入公开资源。2026-10-24 按用户要求新增三套软件的核心工程下载，不分发完整结果与缓存目录。

公开数据在 `src/data/qr-grid-patch.json`，只有展示所需参数、曲线和指标。
`scripts/prepare-case-data.mjs` 从用户指定的本地研究目录输出去除本机路径的数据，
同时核对采样、RMSE、窗口最低值、像素数及桥接数，不修改研究目录。
`scripts/render-case-figures.py` 使用 Matplotlib 生成同源数据的静态 SVG。
`scripts/check-case-preview.mjs` 接收预览地址、Chrome 路径和 Playwright 模块路径，
检查交互、来源、路由、布局及 WebGL 备用图，截图保存于忽略目录 `.local-preview`。

## 回溯

阶段提交保存在本地分支，当前 Docs 开发不修改已发布的 `main` 分支。
需要撤销阶段时，可对相应提交执行 `git revert`，保留完整历史。
切换分支前先保存当前修改；不要用强制重置覆盖尚未保存的工作。

## 二维码网格天线工程下载（2026-10-24，本地）

- 详情页在原论文来源下增加版本下拉框：HFSS / FEM · v1、CST / FIT · v1、FEKO / MoM · v3；修订号与软件发行版本分开标注，不虚构历史版本。
- `scripts/prepare-qr-downloads.ps1 -SourceDirectory <核心四文件目录>` 只读指定的四个原生文件，按软件生成三个 ZIP；FEKO 包含 `.cfx` 与 `.fek`。包内附原论文署名、DOI、软件版本、文件清单与 SHA-256。
- 发布资产位于 `public/models/qr-grid-patch/`，选择项与校验信息位于 `src/data/qr-downloads.json`。不包含源目录路径、论文原文件、完整结果缓存或脚本；原生文件不修改。
- 下载包并非完整结果备份；本轮不连接工程软件、不重新求解、不声明已验证旧版软件兼容性。包内文件逐一核对原始哈希。
- `scripts/check-qr-downloads.mjs` 接收预览地址、Chrome 路径和 Playwright 模块路径；检查三种选择、实际浏览器下载哈希、键盘操作、刷新及四种屏宽。开发地址与 `/rf-agent-lab/` 生产子路径均已通过。
- 本轮 `npm run build`、原案例、BLC baseline 与 Docs 回归检查均通过；原有的大体积资源构建警告仍保留，不影响构建成功。
- 仅本地调试，未推送 GitHub。

## BLC baseline 模型本地预览（2026-10-24）

- 新模型地址：`http://127.0.0.1:4173/#/cases/blc-baseline`，广场地址仍为 `#cases`。
- 只提供 `baseline`，不展示、不打包另外两组扰动工程。
- 来源目录由 `scripts/prepare-blc-model.mjs <source-directory>` 只读检查；不执行来源脚本、不连接 AEDT、不求解。
- 网页按 AEDT 保存的变量及 baseline 几何审计清单重建结构，默认 45° 视角、自动旋转关闭；支持俯视、显隐、分层和完整重置。
- `public/models/blc-baseline/blc_baseline.aedt` 与原工程逐字节相同；附 `parameters.json`，不复制 `.aedtresults`、会话日志或第三方模型。
- 该单文件下载提供可编辑模型与仿真设置，不包含已有求解结果；未在本轮通过 AEDT 重开验证。
- 原汇总报告的中心频率指标未按名为 `Freq [GHz]` 的列读取，与实际 8 GHz 行不一致。新页面不展示性能曲线或指标，不修改来源流水线。
- 静态检查细节、原文件哈希与上述不一致记录在忽略目录 `.local-preview/blc-validation.json`；不作为公开资产。
- 运行 `scripts/check-blc-preview.mjs` 检查模型、真实视角重置、文件下载哈希、刷新/历史、窄屏与 WebGL 备用图；原案例与 Docs 的回归脚本仍保留。
- 本次修改保持本地，原 Docs 未发布修改继续保留；等待用户确认后再安排 GitHub 发布。
- 栏目列表采用内容优先布局：除首页外，MCP、Case Studies、Skills、Visual Lab、Docs 均移除顶部宣传标题和介绍文案，顶部留白缩至桌面 28px / 手机 20px；功能选择与搜索保留，详情页内容不删减。
- MCP、Case Studies 列表在桌面/平板采用双栏，手机（≤760px）单栏。Docs 按用户最新要求与 Skills 共用紧凑卡片列宽（桌面四列 / 平板两列 / 手机一列），仅一个真实项目时占最左格，不补占位项；案例卡片只显示图片、名称和气泡标签。

## 发布准备（2026-10-24）

- 用户已确认发布上述本地调整，包括 Docs、紧凑列表布局、BLC baseline 与二维码天线三软件工程下载。
- 公开仓库中的 Docs 验证记录也隐藏本机解释器与包入口路径；修改前的四份原始记录保留在忽略目录 `.local-preview/docs-source-before-publication/`。
- 原始文档 ZIP 留在本地并加入忽略规则，不上传；文档正文中的 `E:\YourProject` 只是教学示例路径。
