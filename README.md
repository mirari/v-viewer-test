# v-viewer-test

独立的 TypeScript 消费项目，参考 vue-fullscreen-test，用真实 npm 发布包验证组件、指令和 API。没有链接 v-viewer 本地源码、workspace 库或本地 tarball。

2026-10-23 本地 `pnpm check` 已通过：格式检查、依赖核对、三个应用的类型检查和生产构建，以及全部 **29 项 Chromium 测试**。未发现发布包功能问题；Nuxt SSR、水合和路由卸载清理正常。

| 环境     | Vue    | v-viewer        | 工具链                      | 开发地址              |
| -------- | ------ | --------------- | --------------------------- | --------------------- |
| Vue 2    | 2.7.16 | 4.0.0（legacy） | Vite 7 + TypeScript 5.3     | http://127.0.0.1:5202 |
| Vue 3    | 3.5.44 | 5.0.0（latest） | Vite 8 + TypeScript 5.9     | http://127.0.0.1:5203 |
| Nuxt SSR | 3.5.44 | 5.0.0（latest） | Nuxt 4.6.2 + TypeScript 5.9 | http://127.0.0.1:5204 |

2026-10-23 核对 npm dist-tags 后固定以上版本。Viewer.js 由 v-viewer 自动安装，本次解析到 1.15.2；消费端未显式安装 viewerjs，也未手动导入默认 CSS。锁文件用于复现安装。

## 启动

使用 Node 24.15+ 和 pnpm 12.14.0：

```sh
pnpm install --frozen-lockfile
pnpm dev
```

可以单独运行 `pnpm dev:vue2`、`pnpm dev:vue3`、`pnpm dev:nuxt`。生产预览运行 `pnpm build`、`pnpm preview`，端口为 **4302 / 4303 / 4304**。

## 手动用例

- 默认五张图片，最多十张；添加和删除图片同时更新组件、指令和 API 输入。
- **组件**：直接属性、Vue 事件、组件 ref 方法；切换 inline/弹窗模式，比较工具栏追加插槽和完整替换插槽。
- **指令**：使用 v-html 渲染受信任的本地图片片段，模拟 Markdown/HTML 内容更新；通过原生 viewed 事件接收状态。
- **API**：按钮打开图片数组，initialViewIndex 为 1；修改图片或配置后在下次新建图库时生效。打开期间上方浮动面板可以调用 hide()/destroy()，并观察 hidden 回调次数。
- 缩略图 src 为 240 × 160，data-source 为 960 × 640；打开后使用原图。
- Nuxt 直接渲染组件和指令，并在 setup 中调用 useViewer；没有使用 ClientOnly 或 ssr:false。服务端数据、图片 DOM 直接出现在 HTML 中。

Vue 2 保留全局插件注册和 $viewerApi，Vue 3/Nuxt 使用模块导入和 useViewer。三个应用的示例代码分别位于 apps/vue2/src/App.vue、apps/vue3/src/Demo.vue、apps/nuxt/app/components/ViewerDemo.vue。

## 自动验证

```sh
pnpm exec playwright install chromium
pnpm check
```

- verify:dependencies：验证真实 node_modules 包版本、传递依赖及 CommonJS 服务端导入，输出 output/installed-packages.json。
- typecheck：三个应用的严格 TypeScript 与 Vue 模板类型检查。
- build：两个 Vite 生产构建及 Nuxt Nitro Node 服务端构建。
- test:e2e：29 项 Chromium 测试，覆盖原图加载、整页弹窗、导航、旋转、缩放、动态 DOM、工具栏、插槽、API 清理、移动布局、SSR 和路由卸载。

已有构建时可以运行 pnpm test:e2e；pnpm test 会先构建。使用 pnpm exec playwright show-report 查看报告，截图和失败 trace 位于 output/playwright/。

测试范围是 Windows / Chromium / Vue 2.7.16 / Vue 3.5.44 / Nuxt 4.6.2，不代表已覆盖 Vue 2 最低支持版本、Nuxt 2 或其他浏览器。本项目不发布 npm 包，也不部署到线上。
