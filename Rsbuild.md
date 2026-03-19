
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
  pnpm add dexie dexie-react-hooks
  # pnpm add ahooks
  # pnpm remove ahooks
  pnpm add react-router
  pnpm add zustand
  pnpm add @mantine/core @mantine/hooks
  pnpm add @tanstack/react-query
  pnpm add @tanstack/react-virtual
  
  pnpm add @tauri-apps/api
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



4. 调试建议 (Debug)
如果依然不显示，请使用以下方法定位问题：

编译带控制台的版本：使用 npm run tauri build -- --debug 进行打包。这样运行生成的 .exe/.app 时可以右键打开 审查元素 (Inspect)。

查看 Console 报错：

如果是 404，说明路径没找对。

如果是 CSP 或 Not allowed to load local resource，说明权限/安全配置有问题

# 调试版本打包
pnpm tauri build --debug