import { invoke, Channel } from "@tauri-apps/api/core";
import { useEffect, useState } from "react";
import { tokenStore } from "utils";


export const Test4 = () => {

    const tokenValue = tokenStore.get()?.token;

    const [topics, setTopics] = useState([
        "chat/single/+",
        "chat/group/+"
    ])

    useEffect(() => {
        if (!tokenValue) return;
        const channel = new Channel();
        channel.onmessage = (msg) => {
            console.log("MQTT消息:", msg);
        };
        invoke("subscribe", {
            clientId: "tauri-user-001",
            host: "192.168.2.1",
            port: 1883,
            username: "jwt",
            password: tokenValue,
            topics: topics,
            onMessage: channel,
        }).catch((err) => { console.error("MQTT订阅失败:", err); });

        return () => {
            invoke("unsubscribe").catch((err) => {
                console.error("MQTT停止失败:", err);
            });
        };
    }, [tokenValue, topics])



    return <div>
        订阅测试
    </div>
}