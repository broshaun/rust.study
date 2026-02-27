# 0) 确认基础工具（macOS 需要）
xcode-select -p || xcode-select --install

# 1) 安装 Flutter（推荐用 git，最稳）
cd ~
git clone https://github.com/flutter/flutter.git -b stable

# 2) 配置环境变量（zsh 默认）
echo 'export PATH="$HOME/flutter/bin:$PATH"' >> ~/.zshrc
echo 'export PUB_HOSTED_URL=https://pub.flutter-io.cn' >> ~/.zshrc
echo 'export FLUTTER_STORAGE_BASE_URL=https://storage.flutter-io.cn' >> ~/.zshrc
source ~/.zshrc

flutter clean
flutter pub get


open -a Simulator
flutter devices
flutter run -d "iPhone"



brew install cocoapods
pod --version

# 3) 检查 Flutter 是否可用
flutter --version
# 4) 运行诊断（非常关键）
flutter doctor -v



# 创建项目
flutter create --platforms=ios,android fapp1

# 运行虚拟机运行
open -a Simulator
flutter devices
flutter run -d ios


# 打包
flutter clean
flutter pub get
flutter analyze


2) 上架包 AAB（Google Play 必用）
flutter build appbundle --release

2) 上架包ios
flutter build ios --release