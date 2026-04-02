
## Rsbuild

### 创建项目
```sh
  pnpm create rsbuild@latest

Template created! To get started run:

  cd chatly
  pnpm install
  pnpm add -D @tauri-apps/cli
  
  pnpm tauri init
  pnpm tauri android init
  pnpm tauri ios init


For Desktop development, run:
  pnpm tauri dev

For Android development, run:
  pnpm tauri android dev

For iOS development, run:
  pnpm tauri ios dev

  pnpm tauri build
  
```


### 安装前端包
```sh
  pnpm add @tauri-apps/api
  pnpm add react-router
  # pnpm add ahooks
  # pnpm remove ahooks
  pnpm add dexie dexie-react-hooks
  pnpm add zustand
  pnpm add @mantine/hooks @mantine/core @tabler/icons-react
  pnpm add @tanstack/react-query
  pnpm add @tanstack/react-virtual

  # pnpm add @rsbuild/plugin-basic-ssl -D
  pnpm remove opus-decoder opus-recorder
  pnpm add @wasm-audio-decoders/opus-decoder @wasm-audio-decoders/opus-encoder
   pnpm add opus-decoder
```


### 安装Tauri插件
```sh
  pnpm tauri add http
  pnpm tauri add dialog
  pnpm tauri add fs
  # pnpm tauri add store
```



cargo install tauri-cli --version "^2.10" --locked
cnpm install @tauri-apps/api@2.10.2



4. 调试建议 (Debug)
如果依然不显示，请使用以下方法定位问题：

编译带控制台的版本：使用 npm run tauri build -- --debug 进行打包。这样运行生成的 .exe/.app 时可以右键打开 审查元素 (Inspect)。

查看 Console 报错：

如果是 404，说明路径没找对。

如果是 CSP 或 Not allowed to load local resource，说明权限/安全配置有问题

# 调试版本打包
pnpm tauri build --debug