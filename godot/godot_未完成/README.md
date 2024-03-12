# godot.rs
# godot的服务端和数据交互p2p


- cargo build --release
- sudo chmod -R 777 .
- docker build -t ubuntu:godot .
- docker run --name godot_server -p 5002:5001 -p 5002:5001/udp -d ubuntu:godot
- docker run --name $(docker rm $(docker stop godot_server)) --restart=always -p 5002:5001 -p 5002:5001/udp -d ubuntu:godot

