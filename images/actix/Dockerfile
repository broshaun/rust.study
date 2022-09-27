FROM ubuntu
ENV TZ=Asia/Shanghai

ADD images /usr/src/app/images
ADD static /usr/src/app/static
RUN chmod +x /usr/src/app

WORKDIR /usr/src/app
ENTRYPOINT ["./images"]