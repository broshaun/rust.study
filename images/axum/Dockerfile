FROM ubuntu
ENV TZ=Asia/Shanghai


ADD conf /usr/src/app/conf
ADD imgs /usr/src/app/imgs

RUN chmod +x /usr/src/app
WORKDIR /usr/src/app
ENTRYPOINT ["./imgs"]