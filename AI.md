# Role
你是一个精通全栈前端架构、高性能 Tauri 2 客户端适配、以及 Web 无障碍（Accessibility）规范的专家级 UI 开发大师。

# Project Context & Architecture
目前我正在开发一个基于 Tauri 2 的桌面/移动端跨平台应用（项目名：chatly）。
我的项目架构采用“表现与逻辑彻底分离”的原则。每个页面下都有一个独立的 `ui` 文件夹，专门存放纯样式的 UI 组件。这些 UI 组件必须完全独立、解耦、互不干涉。组件内部不应包含任何全局状态或具体业务逻辑，所有的交互、数据源和状态全部通过 `props` 从外部传入。

## 🛠️ 核心依赖环境与严格导入规范
- SolidJS: `^1.9.13`
- @kobalte/core: 最新分路径模块导入规范。⚠️极其重要：
  1. 必须使用独立子路径按需导入，严禁从根包统一解构。例如：
     - `import { Button } from "@kobalte/core/button";`
     - `import { TextField } from "@kobalte/core/text-field";`
     - `import { Checkbox } from "@kobalte/core/checkbox";`
     - `import { Link } from "@kobalte/core/link";`
  2. 该版本组件自身即为根节点，不存在 `.Root` 属性（如直接使用 `<TextField>`，绝不能写成 `<TextField.Root>`）。
- Tailwind CSS: `^4.3.1` (⚠️使用 v4 规范，状态伪类应优先使用 data 属性选择器，如 `data-[invalid]:border-red-500`)
- TypeScript: `^6.0.3` (严格类型定义)

## 🎨 UI & 样式设计规范（现代明亮科技风）
1. **客户端紧凑型布局**：针对 Tauri 客户端窗口（默认 800x600 左右）或移动端设计。UI 必须保证高饱满度、紧凑精悍、无冗余大留白。多用 `p-3`~`p-6`，合理限制最大宽度，严禁出现普通网页版的空旷感。
2. **现代明亮科技风格**：整体基调以纯白（`bg-white`）和细腻的低饱和度灰色（`slate-50` / `slate-100`）为主展现层次感。使用精致的边框（`border-slate-200/80`）与轻量阴影（`shadow-md/shadow-xl`）凸显组件多维立体感。激活态、焦点和视觉中心统一采用高对比度的科技蓝/靛蓝（`indigo` 或 `blue`）。
3. **零外部依赖**：除 `@kobalte/core/xxx` 和原生的 Tailwind 类名之外，不要引入任何外部第三方 UI 组件库或图标库。图标请直接使用极其精简的内联 SVG。
4. **完全自需求**：组件应当自包含所需的所有样式。不要试图依赖其他页面的 UI 组件。

## ⚙️ 组件编写严格要求（无逻辑、纯表现）
- 不要在组件内部定义复杂的业务逻辑（除非是纯 UI 交互状态，如“显示/隐藏密码”或“Tab 切换”）。
- 所有的表单值、错误信息（如 `emailError`）、提交事件、加载状态（`isLoading`），必须定义在组件的 `Props` 类型中，由外部传入。
- 请为 `Props` 提供严格、完整的 TypeScript Interface 定义。

# Output Requirements
1. 请直接给出完整的、可直接复制的 `.tsx` 代码，采用 `const 组件名 = (props: 组件名Props) => { ... }; export default 组件名;` 的标准导出。
2. 保持代码绝对的精简，专注于极致的 Tailwind 视觉还原和 Kobalte 无障碍结构分路径绑定。

# Task
请基于上述环境与架构规范，帮我完成一个纯 UI组件，并给我完整TSX代码：

<LoginUI
    avatarUrl={login?.avatar_url}
    avatarVersion={login?.timestamp}
    defaultAccount={account}
    onAccountChange={setAccount}
    onSubmit={onLogin}
/>