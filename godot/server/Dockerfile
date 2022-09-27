FROM ubuntu
ENV TZ=Asia/Shanghai

ADD . /usr/src/app
RUN chmod +x /usr/src/app

WORKDIR /usr/src/app
ENTRYPOINT ["./godot_server"]