import React, { useState, useEffect, useRef } from 'react';
import { invoke, Channel } from '@tauri-apps/api/core';
import { listen } from '@tauri-apps/api/event'


export const Test = () => {


    // 接收单条信息
    listen("message", (e) => {
        console.log(e.payload);
    })

    // 触发 Rust 发送
    const send_to_this_window = async () => {
        invoke("send_to_this_window")
    }


    const p2p_start = async () => {
        try {
            const rsp = await invoke('p2p_start');
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


    const p2p_start_accept = async () => {
        const onData = new Channel();

        // 核心：直接在控制台输出
        onData.onmessage = (data) => {
            // data 是来自 Rust 的字节数组 (Uint8Array)
            const text = new TextDecoder().decode(new Uint8Array(data));
            console.log("📬 [P2P Recv]:", text);
            console.log("📦 [Raw Bytes]:", data);
        };

        try {
            console.log("📡 建立接收通道...");
            let rsp = await invoke('p2p_start_accept', { onData });
            console.log(rsp);
        } catch (err) {
            console.error(err);
        }
    };



    const [inputAddr, setInputAddr] = useState("");
    const p2p_start_connect = async (addr) =>  {
        const onData = new Channel();

        // 核心：直接在控制台输出
        onData.onmessage = (data) => {
            // data 是来自 Rust 的字节数组 (Uint8Array)
            const text = new TextDecoder().decode(new Uint8Array(data));
            console.log("📬 [P2P Recv]:", text);
            console.log("📦 [Raw Bytes]:", data);
        };

        try {
            console.log("📡 建立接收通道...");
            let rsp = await invoke('p2p_start_connect', {addr, onData });
            console.log(rsp);
        } catch (err) {
            console.error(err);
        }
    };

    const p2p_send = async () => {
        try {
            const text = "hello p2p";
            const data = Array.from(new TextEncoder().encode(text));

            console.log("📤 [P2P Send]:", text, data);

            let rsp = await invoke("p2p_send", {
                data,
            });

            console.log("✅ 发送反馈",rsp);
        } catch (err) {
            console.error("❌ 发送错误:", err);
        }
    };


    const p2p_ticket = async () => {
        try {
            const rsp = await invoke('p2p_get_ticket');
            console.log(rsp);
        } catch (err) {
            console.error(err);
        }
    }


    

    return <div style={{ padding: '20px' }}>
        <br />
        <button onClick={p2p_start}>启动后台任务(节点)</button>
        <br />
        <button onClick={p2p_stop}>停止后台任务(节点)</button>
        <br />
        <button onClick={p2p_test}>任务测试</button>
        <br />
        <button onClick={p2p_start_accept} >启动节点监听 </button>

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
        >发起连接</button>

        <br />
        <button onClick={p2p_send}>发送信息</button>

        <br />
        <button onClick={p2p_ticket}>获取本地连接密钥</button>


        {/* <br />
        <button onClick={send_to_this_window}>Rust发送至前端</button> */}



    </div>


}