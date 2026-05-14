import { usePcmCapture } from "utils/hooks/usePcmCapture";
import { usePcmPlayback } from "utils/hooks/usePcmPlayback";
import { invoke, Channel } from '@tauri-apps/api/core';
import React, { useState, useEffect, useRef } from 'react';


export function PcmTestPage() {

  const local_playback = usePcmPlayback({
    sampleRate: 48000,
    frameSamples: 480,
    defaultPlaying: false,
  });

  const local_capture = usePcmCapture({
    sampleRate: 48000,
    frameSamples: 480,
    onData: (bytes) => {
      local_playback.pushBytes(bytes);
    },
  });




  const p2p_playback = usePcmPlayback({
    sampleRate: 48000,
    frameSamples: 480,
    defaultPlaying: false,
  });
  const p2p_capture = usePcmCapture({
    sampleRate: 48000,
    frameSamples: 480,
    onData: (bytes) => {
      void invoke("p2p_send", {
        data: Array.from(bytes),
      }).catch(console.error);
    },
  });





  const p2p_start = async () => {
    try {
      const rsp = await invoke('p2p_start');
      console.log(rsp);
    } catch (err) {
      console.error(err);
    }
  };


  const p2p_start_accept = async () => {
    const onData = new Channel();

    onData.onmessage = (data) => {
      // data 是来自 Rust 的字节数组 (Uint8Array)
      p2p_playback.pushBytes(data)
    };

    try {
      console.log("📡 建立接收通道...");
      const rsp = await invoke('p2p_start_accept', { onData });
      console.log(rsp);
    } catch (err) {
      console.error(err);
    }
  };


  const [inputAddr, setInputAddr] = useState("");
  const p2p_start_connect = async (addr) => {
    const onData = new Channel();

    onData.onmessage = (data) => {
      // data 是来自 Rust 的字节数组 (Uint8Array)
      p2p_playback.pushBytes(data);
    };

    try {
      console.log("📡 建立接收通道...");
      let rsp = await invoke('p2p_start_connect', { addr, onData });
      console.log(rsp);
    } catch (err) {
      console.error(err);
    }
  };

  const p2p_stop = async () => {
    try {
      const rsp = await invoke('p2p_stop');
      console.log(rsp);
    } catch (err) {
      console.error(err);
    }
  }



  const p2p_test = async () => {
    try {
      const rsp = await invoke('p2p_test');
      console.log(rsp);
    } catch (err) {
      console.error(err);
    }
  }

  const [state,setState] = useState("")
  const p2p_state = async () => {
    const onData = new Channel();
    onData.onmessage = (data) => {
      console.log('当前节点状态',data)
      setState(data)
    };
    try {
      const rsp = await invoke('p2p_state', { onData });
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




  return (
    <div style={{ padding: 24 }}>
      <h2>本地 PCM Test</h2>
      <p>采集状态：{local_capture.status}</p>
      <p>播放状态：{local_playback.status}</p>
      <br />
      <button onClick={local_playback.start}>本地播放测试</button>
      <button onClick={local_playback.stop}>本地播放停止</button>
      <br />
      <button onClick={local_capture.startCapture}>本地采集测试</button>
      <button onClick={local_capture.stopCapture}>本地采集停止</button>
      <br />
      <br />


   

      <h2>通话测试</h2>
      <p>采集状态：{p2p_capture.status}</p>
      <p>播放状态：{p2p_playback.status}</p>
      <br />
      <button onClick={p2p_playback.start}>本地播放测试</button>
      <button onClick={p2p_playback.stop}>本地播放停止</button>
      <br />
      <br />
      <button onClick={p2p_capture.startCapture}>本地采集测试</button>
      <button onClick={p2p_capture.stopCapture}>本地采集停止</button>
      <br />
      <br />
      <button onClick={p2p_start}>开启节点</button>
      <br />
      <br />
      <button onClick={p2p_start_accept}>发起通话 </button>
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
      >对应通话接收</button>

      <br />
      <button onClick={p2p_stop} >结束通话并关闭节点</button>

      <br />
      <button onClick={p2p_test}>任务测试</button>
      <br />
      <br />
      <p>节点状态：{state}</p> <button onClick={p2p_state}>节点状态监听</button>
      <br />
      <br />
      <button onClick={p2p_ticket}>连接密钥</button>

    </div>
  );
}