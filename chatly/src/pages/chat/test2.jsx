import { usePcmCapture } from "hooks/voice/usePcmCapture";
import { usePcmPlayback } from "hooks/voice/usePcmPlayback";
import { invoke, Channel } from '@tauri-apps/api/core';
import React, { useState, useEffect, useRef } from 'react';


export function PcmTestPage() {

  const p2p_init = async () => {
    try {
      const rsp = await invoke('p2p_init');
      console.log(rsp);
    } catch (err) {
      console.error(err);
    }
  };


  const p2p_close = async () => {
    try {
      const rsp = await invoke('p2p_close');
      console.log(rsp);
    } catch (err) {
      console.error(err);
    }
  }

  const p2p_info = async () => {
    try {
      const rsp = await invoke('p2p_info');
      console.log(rsp);
    } catch (err) {
      console.error(err);
    }
  }


  const p2p_ticket = async () => {
    try {
      const rsp = await invoke('p2p_get_ticket');
      console.log(rsp);
    } catch (err) {
      console.error(err);
    }
  }


  const handleStartAccept = async () => {
    try {
      const rsp = await invoke('p2p_start_accept');
      console.log("启动节点监听...");
      console.log(rsp);
    } catch (err) {
      console.error(err);
    }
  };


  const [inputAddr, setInputAddr] = useState("");
  const p2p_start_connect = async (addr) => {
    try {
      console.log("🔗 正在连接:", addr);
      const result = await invoke("p2p_start_connect", {
        addr,
      });

      console.log("✅ 连接成功:", result);
    } catch (err) {
      console.error("❌ 连接失败:", err);
    }
  };

  const p2p_recv = async () => {
    const onData = new Channel();

    // 核心：直接在控制台输出
    onData.onmessage = (data) => {
      // data 是来自 Rust 的字节数组 (Uint8Array)
      const text = new TextDecoder().decode(new Uint8Array(data));
      console.log("📬 [P2P Recv]:", text);
      console.log("📦 [Raw Bytes]:", data);
      const bytes =
        data instanceof Uint8Array
          ? data
          : new Uint8Array(data);

      playback.pushBytes(bytes);



    };

    try {
      console.log("📡 正在建立接收通道...");
      // 注意：由于 Rust 端是 loop，此 await 会一直挂起直到连接关闭
      await invoke('p2p_recv', { onData });
    } catch (err) {
      console.error(err);
    }
  };



  const p2p_send = async () => {
    try {
      const text = "hello p2p";
      const data = Array.from(new TextEncoder().encode(text));

      console.log("📤 [P2P Send]:", text, data);

      await invoke("p2p_send", {
        data,
      });

      console.log("✅ 发送成功");
    } catch (err) {
      console.error("❌ 发送失败:", err);
    }
  };






  const playback = usePcmPlayback({
    sampleRate: 48000,
    frameSamples: 480,
    defaultPlaying: false,
  });

  const capture = usePcmCapture({
    sampleRate: 48000,
    frameSamples: 480,
    onData: (bytes) => {
      // playback.pushBytes(bytes);
      void invoke("p2p_send", {
        data: Array.from(bytes),
      }).catch(console.error);
    },
  });

  const stopAll = async () => {
    await capture.stopCapture();
    await playback.stop();
  };

  return (
    <div style={{ padding: 24 }}>

      <h2>PCM Test</h2>

      <button onClick={p2p_init}>1. 初始化节点</button>
      <button onClick={p2p_close}>2. 关闭节点</button>
      <button onClick={p2p_info}>3. 节点详情</button>
      <button onClick={p2p_ticket}>4. 连接密钥</button>


      <br />
      <button onClick={handleStartAccept} >1. 启动节点监听 </button>


      <br />
      <input
        type="text"
        value={inputAddr}
        onChange={(e) => setInputAddr(e.target.value)}
        placeholder="请输入连接地址"
        style={{ width: 500 }}
      />
      <button
        onClick={() => p2p_start_connect(inputAddr)}
        disabled={!inputAddr.trim()}
      >
        1.发起连接
      </button>


      <br />
      <button onClick={p2p_send}>5.发送信息</button>

      <br />
      <button onClick={p2p_recv}>启动接收信息</button>

      <button onClick={capture.startCapture} disabled={capture.isCapturing}>
        开始采集
      </button>

      <button onClick={capture.stopCapture} disabled={!capture.isCapturing}>
        停止采集
      </button>

      <br />
      <button onClick={playback.start} disabled={playback.isPlayingEnabled}>
        开启播放
      </button>

      <button onClick={playback.stop} disabled={!playback.isPlayingEnabled}>
        停止播放并释放
      </button>

      <button onClick={stopAll}>全部停止</button>

      <p>采集状态：{capture.status}</p>
      <p>播放开关：{playback.isPlayingEnabled ? "ON" : "OFF"}</p>
      <p>播放状态：{playback.status}</p>

      {capture.error && (
        <p style={{ color: "red" }}>
          采集错误：{capture.error.message || String(capture.error)}
        </p>
      )}

      {playback.error && (
        <p style={{ color: "red" }}>
          播放错误：{playback.error.message || String(playback.error)}
        </p>
      )}

    </div>
  );
}