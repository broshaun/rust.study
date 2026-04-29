import React, { useState, useEffect, useRef } from 'react';
import { invoke, Channel } from '@tauri-apps/api/core';
import { listen } from '@tauri-apps/api/event'


export const Test = () => {

    listen("message", (e) => {
        console.log(e.payload);
    })

    // 触发 Rust 发送
    const send_to_this_window = async () => {
        invoke("send_to_this_window")
    }

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



    return <div style={{ padding: '20px' }}>

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
        <button onClick={p2p_recv}>6.接收信息</button>


        <br />
        <button onClick={send_to_this_window}>7.Rust发送至前端</button>



    </div>


}