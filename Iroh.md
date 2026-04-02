  我先给你技术架构，我们根据这个做后续优化
  Iroh实时语音通话
      1、Iroh不管包数据的内容，只管做数据转发。
      2、Iroh使用默认的传输方式
      3、使用 Iroh Stream	可靠传输，保证顺序。
      4、虽然 Iroh 不管内容，但因为 Stream 是流式的。需要长度前缀 (Length Prefix)、数据类型(data type)
    
  
修改代码，并直接输出完整代码



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

根据这个代码。拆分为
useP2PTransport 只管数据上下传递
useOpusVoice 使用opus-recorder和opus-decoder数据编码解码
两个需要互相独立，给我jsx代码。



@wasm-audio-decoders/opus-ml