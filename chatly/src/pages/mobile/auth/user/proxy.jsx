import { apiBase, apiImgs, apiMqtt, createHttpClient, currentModal } from "utils";
import { ProxySetting } from "./ui/ProxySetting";
import { useState } from "react";
import { http as http2 } from "utils";


export const Proxy = () => {
    const { open, close } = currentModal();
    const { http } = createHttpClient('/rpc/chat/ping/');
    const [api, setApi] = useState(() => apiBase.get())
    const [img, setImg] = useState(() => apiImgs.get())
    const [mqtt, setMqtt] = useState(() => apiMqtt.get())


    async function handlePing() {
        try {
            const results = await http.requestBodyJson("get", {});
            const { code, data, message } = results;
            if (code !== 200) {
                throw new Error(message);
            }
            open({
                title: "Ping测试",
                message: data,
                onConfirm: close,
                onCancel: null
            });
        } catch (e) {
            open({
                title: "Ping测试",
                message: e?.message || String(e),
                onConfirm: close,
                onCancel: null
            });
        }
    }

    async function handlePingImgs(url) {
        console.log('url', url)
        if (!url || typeof url !== 'string') {
            open({
                title: 'Ping测试',
                message: '服务地址不能为空，请检查配置',
                onConfirm: close,
            });
            return;
        }
        try {
            const results = await http2.get(`${url}/minio/health/live`)
            if (results?.code === 200) {
                open({
                    title: 'Ping测试',
                    message: '测试成功',
                    onConfirm: close,
                });
                return;
            } else if (results?.code === 404) {
                open({
                    title: 'Ping测试',
                    message: '连接超时！',
                    onConfirm: close,
                });
                return;
            }
        } catch (e) {
            open({
                title: "Ping测试",
                message: e?.message || String(e),
                onConfirm: close,
                onCancel: null
            });
        }
    }


    const handleSave = (newApi, newImg, newMqtt) => {
        console.log('newMqtt++', newMqtt)
        apiBase.set(newApi);
        apiImgs.set(newImg);
        apiMqtt.set(newMqtt)
        setApi(newApi);
        setImg(newImg);
        setImg(newMqtt)
        console.log('新配置newApi', newApi);
        console.log('新配置newImg', newImg);
        console.log('新配置newMqtt', newMqtt);
    };

    return <div>
        <ProxySetting
            apiBase={api}
            imgBase={img}
            mqttBase={mqtt}
            onPingApi={handlePing}
            onPingImg={handlePingImgs}
            onPingMqtt={() => { }}
            onSave={handleSave}
        />
    </div>
}