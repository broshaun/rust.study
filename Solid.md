
## Solid

### 创建项目
```sh
pnpm create rsbuild@latest

Template created! To get started run:

  cd chatly
  pnpm install
  pnpm add -D @tauri-apps/cli@latest
  
  pnpm tauri init
  pnpm tauri android init
  pnpm tauri ios init


For Desktop development, run:
  pnpm tauri dev

For Android development, run:
  pnpm tauri android dev

For iOS development, run:
  pnpm tauri ios dev
  
```


### 安装前端包
```sh
pnpm add dexie  
pnpm add @solidjs/router
```


### 安装Tauri插件
```sh
pnpm tauri add http
pnpm tauri add dialog
pnpm tauri add fs
pnpm tauri add store
```