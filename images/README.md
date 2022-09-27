# images
图片服务


- cargo build --release
- sudo chmod -R 777 .
- docker build -t ubuntu:imgs .
- docker run --name imgs --privileged --restart=always  -v ${PWD}/static:/usr/src/app/static -p 5000:8000 -d ubuntu:imgs
- docker run --name $(docker rm $(docker stop imgs)) --privileged --restart=always -v ${PWD}/static:/usr/src/app/static -p 5000:8000 -d ubuntu:imgs
