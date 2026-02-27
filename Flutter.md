# 0) 确认基础工具（macOS 需要）
xcode-select -p || xcode-select --install

# 1) 安装 Flutter（推荐用 git，最稳）
cd ~
git clone https://github.com/flutter/flutter.git -b stable

# 2) 配置环境变量（zsh 默认）
echo 'export PATH="$HOME/flutter/bin:$PATH"' >> ~/.zshrc
source ~/.zshrc

# 3) 检查 Flutter 是否可用
flutter --version

# 4) 运行诊断（非常关键）
flutter doctor -v






flutter create --platforms=ios,android fapp1