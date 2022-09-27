# image.rs
图片服务



- cargo build --release
- sudo chmod -R 777 .
- docker build -t ubuntu:imgs .
- docker run -it -v ${PWD}/static:/usr/src/app/static -p 8001:8001 ubuntu:imgs bash
- docker run --name imgs --restart=always -v ${PWD}/static:/usr/src/app/static -p 8001:8001 -d ubuntu:imgs
- docker rm $(docker stop imgs)
- docker run --name $(docker rm $(docker stop imgs)) --restart=always -v ${PWD}/static:/usr/src/app/static -p 8000:8000 -d ubuntu:imgs

