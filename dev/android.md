

## 创建安卓项目
- cargo tauri android init
1. 强行建立安卓目录结构
- mkdir -p src-tauri/gen/android/app/src/main
2. 直接写入 AndroidManifest.xml 安装设置


### 生成 keystore（macOS
```sh
keytool -genkeypair \
  -keystore chatly-release.jks \
  -storetype JKS \
  -alias chatly \
  -keyalg RSA -keysize 2048 -validity 10000
```



- git tag android-v1.0.33
- git push origin android-v1.0.33



