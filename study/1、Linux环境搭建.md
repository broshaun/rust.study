# Tauri 项目搭建
    sudo chmod -R 777 .

## Nodejs安装
    1、安装npm会带有nodejs
    - sudo apt-get install npm
    2、升级npm
    - sudo npm install -g n
    - sudo n stable
    3、重启终端后配合国内源
    - sudo npm install -g cnpm --registry=https://registry.npm.taobao.org

## Linux 编译环境
    export PKG_CONFIG_PATH=/usr/lib/pkgconfig:/usr/share/pkgconfig
    sudo apt update
    sudo apt install libwebkit2gtk-4.0-dev \
        build-essential \
        curl \
        wget \
        libssl-dev \
        libgtk-3-dev \
        libayatana-appindicator3-dev \
        librsvg2-dev \
        ibjavascriptcoregtk-4.0-dev \
        libsoup2.4-dev