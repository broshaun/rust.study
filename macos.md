



## 指定系统架构打包

### 打包 Intel 目标
- rustup target add x86_64-apple-darwin 
- cargo tauri build --target x86_64-apple-darwin

### 打包 App M 系列目标
- rustup target add aarch64-apple-darwin
- cargo tauri build --target aarch64-apple-darwin


### 全兼容打包
- cargo tauri build --target universal-apple-darwin 




git tag macos-v1.0.21
git push origin macos-v1.0.21