import React, { useState, useEffect, useRef } from 'react';
import { invoke, Channel } from '@tauri-apps/api/core';
import { listen } from '@tauri-apps/api/event'


export const Test = () => {
    const [ticket, setTicket] = useState('');
    const [info, setInfo] = useState('');
    const [text, setText] = useState('');
    const [addr, setAddr] = useState('');


    listen("message", (e) => {
        console.log(e.payload);
    })

    // 触发 Rust 发送

    const send_to_this_window = async () =>{
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



    const handleConnect = async () => {
        if (!addr) return alert("请输入目标地址/Ticket");
        try {
            console.log('正在连接到:', addr);
            await invoke('p2p_start_connect', { addr });
            console.log('✅ 连接命令已执行');
        } catch (err) {
            console.error('❌ 连接失败:', err);
        }
    };







    const sendTextMessage = async (text) => {
        console.log('发送消息', text)
        if (!text) return;

        try {
            // 1. 转换数据
            const encoder = new TextEncoder();
            const data = Array.from(encoder.encode(text));

            // 获取当前时间戳
            const time = new Date().toLocaleTimeString();

            // 2. 调用 Rust


            console.log('发送消息data', data)
            const a = await invoke('p2p_send', { data });
            console.log('发送状态', a)

            // 3. 打印带时间的消息
            // console.log(`%c[${time}] ✅ 发送成功:`, "color: #007bff; font-weight: bold;", text);

        } catch (err) {
            const time = new Date().toLocaleTimeString();
            console.error(`[${time}] ❌ 发送失败:`, err);
        }
    };

    return <div style={{ padding: '20px' }}>
        <button onClick={p2p_init}>1. 初始化节点</button>

        <br />
        <button onClick={p2p_close}>2. 关闭节点</button>

        <br />
        <button onClick={p2p_info}>3. 节点详情</button>


        <br />
        <button onClick={p2p_ticket}>4. 连接密钥</button>


        <br />
        <button onClick={handleStartAccept} >5. 启动节点监听 </button>


        <br />
        <button onClick={p2p_recv}>6.接收信息</button>


        <br />
        <button onClick={send_to_this_window}>7.Rust发送至前端</button>

        



        {/* <button onClick={startConnect} style={{ backgroundColor: '#007bff', color: '#fff' }}>
            启动发送
        </button> */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
            <label style={{ fontWeight: 'bold' }}>1. 远程连接地址</label>
            <input
                type="text"
                value={addr}
                onChange={(e) => setAddr(e.target.value)}
                placeholder="粘贴对方的 Ticket"
                style={{ padding: '8px', borderRadius: '4px', border: '1px solid #ccc' }}
            />
            <button
                onClick={handleConnect}
                style={{ backgroundColor: '#007bff', color: '#fff', padding: '10px', border: 'none', borderRadius: '4px', cursor: 'pointer' }}
            >
                启动连接 (Connect)
            </button>
        </div>






        <h4>发送消息</h4>

        <textarea
            value={text}
            onChange={(e) => setText(e.target.value)}
            placeholder="输入内容..."
            style={{ height: '100px', padding: '8px' }}
        />

        <button
            onClick={() => {
                sendTextMessage(text);
                setText(''); // 发送后清空
            }}
            style={{
                backgroundColor: '#007bff',
                color: 'white',
                padding: '10px',
                border: 'none',
                borderRadius: '4px',
                cursor: 'pointer'
            }}
        >
            发送测试消息
        </button>







    </div>


}