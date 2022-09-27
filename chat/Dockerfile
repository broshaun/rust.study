FROM ubuntu
ENV TZ=Asia/Shanghai

ADD chat /usr/src/app/chat
ADD config /usr/src/app/config
RUN chmod +x /usr/src/app

WORKDIR /usr/src/app
ENTRYPOINT ["./chat"]