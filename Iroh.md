Iroh实时语音通话
    1、Iroh不管包数据的内容，只管做数据转发。
    2、Iroh优先使用P2P传输方式，如果无法打通NAT，则使用中继服务转发。
    3、使用 Iroh Stream	可靠传输，保证顺序。
    4、虽然 Iroh 不管内容，但因为 Stream 是流式的。需要长度前缀 (Length Prefix)
    
  


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






编码 (采集)	opus-recorder	采集麦克风并编码最稳，支持 Raw Opus 帧输出，无 Ogg 冗余。
解码 (播放)	opus-decoder	来自 eshaz/wasm-audio-decoders，支持 Opus 1.5 (ML)，丢包补偿性能最强。



Iroh Stream	可靠传输，保证顺序。	推荐。 即使有重传，QUIC 的多路复用也能避免队头阻塞。对于语音通话，顺序非常重要。
Iroh Datagram	不可靠传输，类似 UDP。	追求极低延迟。 如果网络极差，丢一帧就算了，不重传。但你需要自己在应用层处理包序号（SeqNum）。