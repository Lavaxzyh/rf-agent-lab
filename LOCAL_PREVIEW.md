# 本地案例预览

本地分支：`codex/case-studies`。修改前基准：`8adc048`（原 `main`）。
本次只在本地开发，没有推送或触发 GitHub Pages 发布。

## 启动与查看

在仓库目录执行 `npm run dev -- --host 127.0.0.1 --port 4173 --strictPort`。

- Case Studies（04）：`http://127.0.0.1:4173/#cases`
- 完整案例：`http://127.0.0.1:4173/#/cases/qr-grid-patch`
- 构建检查：`npm run build`

## 栏目上线开关

`src/site-config.ts` 的 `panelVisibility` 控制导航、路由和页面展示。
目前 `paper2hfss` 与 `docs` 为 `false`，原页面源码和 Markdown 文件保留。
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
原始论文、课程论文原文件与三套工程均未加入公开资源。

公开数据在 `src/data/qr-grid-patch.json`，只有展示所需参数、曲线和指标。
`scripts/prepare-case-data.mjs` 从用户指定的本地研究目录输出去除本机路径的数据，
同时核对采样、RMSE、窗口最低值、像素数及桥接数，不修改研究目录。
`scripts/render-case-figures.py` 使用 Matplotlib 生成同源数据的静态 SVG。
`scripts/check-case-preview.mjs` 接收预览地址、Chrome 路径和 Playwright 模块路径，
检查交互、来源、路由、布局及 WebGL 备用图，截图保存于忽略目录 `.local-preview`。

## 回溯

阶段提交保存在本地分支，原 `main` 保留基准版本。
需要撤销阶段时，可对相应提交执行 `git revert`，保留完整历史。
切换分支前先保存当前修改；不要用强制重置覆盖尚未保存的工作。
