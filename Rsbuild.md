
## Rsbuild

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

  pnpm tauri build
  
```


### 安装前端包
```sh
  pnpm add dexie dexie-react-hooks
  # pnpm add ahooks
  # pnpm remove ahooks
  pnpm add react-router
  pnpm add zustand
  pnpm add @mantine/core @mantine/hooks
  pnpm add @tanstack/react-query
  pnpm add @tanstack/react-virtual
```


### 安装Tauri插件
```sh
  pnpm tauri add http
  pnpm tauri add dialog
  pnpm tauri add fs
  # pnpm tauri add store
```






// 使用
// @tauri-apps/plugin-http
// @tauri-apps/plugin-fs
// 开发js实现
// /**
//  * ImageCache 服务
//  * 功能：
//  * 1️⃣ 查找本地缓存
//  * 2️⃣ 如果不存在则下载到前端public路径
//  * 3️⃣ 返回本地路径
//  */
//  远程地址示例http://103.186.108.161:5015/imgs/06e5b950405c65eadfe37d1a227fb170.jpg
//  远程的文件名是md5.后缀名。判断图片的唯一性使用md5文件名