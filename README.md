

## 前端环境
### pnpm 安装
- npm list -g pnpm

### 查看安装地址
- npm config get prefix

### 配置执行环境 先把路径加到 zsh 配置里
```sh 
echo 'export PATH="$HOME/.npm-global/bin:$PATH"' >> ~/.zshrc
source ~/.zshrc
```
### 查看版本
- pnpm -v

### 配置为国内镜像
- pnpm config set registry https://registry.npmmirror.com
### 验证镜像
- pnpm config get registry


# Web App 共有包
## 使用Rsbuild框架创建项目
- pnpm create rsbuild@latest
- pnpm add react-router-dom@7.6.x
- pnpm add zustand ahooks@3.9.x
- pnpm add dexie  
- pnpm install

## 仅启动前端 
- pnpm dev
## 前端打包
- pnpm build




## App 核心库
- pnpm add @tauri-apps/api@2.10.2
- pnpm add @tauri-apps/plugin-http
- pnpm add @tauri-apps/plugin-log

## 开发库
- pnpm add -D @tauri-apps/cli@^2
- pnpm add -D concurrently


# 进入前端的项目路径
## 安装 Tauri 的 CLI 工具
## 初始化项目
- cargo tauri init
- cd src-tauri
- cargo uninstall tauri-cli
- cargo install tauri-cli --version "^2.10" --locked

- cargo add tauri-plugin-http
- cargo add tauri-plugin-log

## 运行调试
- cargo tauri dev
## 执行编译
- cargo tauri build



