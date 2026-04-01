    实时语音通话
    1、Iroh不管包数据的内容。只管做数据转发
    2、Iroh优先使用P2P传输方式，如果无法打通NAT则使用中继服务转发
    3、现在需要的是实时、丢包则丢弃。
    4、数据为双向传递   Iroh 负责连通与转发；语音数据走 QUIC datagram；控制信令走 stream。


直播（不适合）改为quinn
1、Iroh不管包数据的内容。只管做数据转发
2、Iroh优先使用P2P传输方式，如果无法打通NAT则使用中继服务转发
3、现在需要的是可以延迟、但是稳定的数据传输。
4、数据为单向传递，需要实现较多人广播




方案 2：自己部署 relay（推荐你未来走这条）

Iroh 已经提供：

👉 iroh-relay server（开源）

特点：

基于 HTTP/HTTPS
默认端口：3340（dev）
支持：
relay forwarding
QUIC address discovery
rate limit
metrics