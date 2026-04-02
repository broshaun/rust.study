

## 前端环境
### pnpm 安装

```sh
  npm list -g pnpm

### 查看安装地址
  npm config get prefix

### 配置执行环境 先把路径加到 zsh 配置里
  echo 'export PATH="$HOME/.npm-global/bin:$PATH"' >> ~/.zshrc
  source ~/.zshrc

### 查看版本
  pnpm -v

### 配置为国内镜像
  pnpm config set registry https://registry.npmmirror.com
  
### 验证镜像
  pnpm config get registry

```

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
  pnpm tauri build --debug

```

### 安装前端包
```sh
  pnpm remove xxx
  pnpm add @tauri-apps/api
  pnpm add react-router
  pnpm add dexie dexie-react-hooks
  pnpm add zustand
  pnpm add @mantine/hooks @mantine/core @tabler/icons-react
  pnpm add @tanstack/react-query
  pnpm add @tanstack/react-virtual
```

### 安装Tauri插件
```sh
  pnpm tauri add http
  pnpm tauri add fs
```
