# Chat

### 调试配置
```s
$Env:RUST_BACKTRACE=1
```


### docker开发环境
- docker run --rm -it -v ${PWD}:/usr/src/app -w /usr/src/app -p 8080:8080 rust bash
- cargo run
### Linux编译
- docker run --rm -v ${PWD}:/usr/src/app -w /usr/src/app rust cargo build --release

### 部署应用
- docker build -t ubuntu:chat .
- docker run --name Chat --restart=always -p 5050:5050 -d ubuntu:chat
- docker rm $(docker stop Chat)
- docker run --name $(docker rm $(docker stop Chat)) --restart=always -p 5050:5050 -d ubuntu:chat


<!-- chmod -R 777 /dir_name -->

