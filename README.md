# Tauri

- cargo install create-tauri-app --locked
- cargo create-tauri-app

## 使用Rsbuild框架创建项目
- cnpm create rsbuild@latest
- cnpm install react-router-dom@7.6.x
- cnpm install zustand ahooks@3.9.x
- cnpm install


## 聊天记录存储
- cnpm install dexie 


## 核心库
- cnpm install @tauri-apps/api@2.10.2
- cnpm install @tauri-apps/plugin-http
- cnpm install @tauri-apps/plugin-log

- cnpm install -D @tauri-apps/cli #安卓打包


# 进入app现有项目路径
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



