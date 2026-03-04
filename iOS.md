rustup target add aarch64-apple-ios           # 真机 (ARM64)
rustup target add aarch64-apple-ios-sim       # Apple Silicon 模拟器
rustup target add x86_64-apple-ios            # Intel 芯片模拟器 (可选)


    
cargo tauri ios init
# 默认启动
cargo tauri ios dev





3. 直接打开 Xcode (推荐)
对于经验丰富的开发者，直接在 Xcode 中处理签名和权限是最稳妥的。您可以运行：

```Bash
cargo tauri ios dev --open
```

打包
cargo tauri ios build



xcrun simctl shutdown all
xcrun simctl boot A21CB646-358E-42D5-8C1D-D2ABF9CC051E
open -a Simulator
cargo tauri ios dev






查看运行的虚拟机
xcrun simctl list devices | grep Booted

## 启动一台虚拟机
open -a Simulator

## 运行并绑定虚拟机
cargo tauri ios dev B28DA3C3-AE4F-48A1-A409-77C57AC4B2C0