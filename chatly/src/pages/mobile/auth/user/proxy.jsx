import { apiBase, apiImgs, createHttpClient, currentModal } from "utils";
import { ProxySetting } from "./ui/ProxySetting";
import { useState } from "react";



export const Proxy = () => {
    const { open, close } = currentModal();
    const { http } = createHttpClient('/rpc/chat/ping/');

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


    async function handlePingImgs(params) {
        //  /minio/health/live
        
    }

    const [api, setApi] = useState(() => apiBase.get())
    const [img, setImg] = useState(() => apiImgs.get())
    const handleSave = (newApi, newImg) => {
        apiBase.set(newApi);
        apiImgs.set(newImg);
        setApi(newApi);
        setImg(newImg);
        console.log('新配置：', newApi, newImg);
    };

    return <div>
        <ProxySetting
            apiBase={api}
            imgBase={img}
            onPingApi={handlePing}
            onPingImg={(va)=>{console.log(va)}}
            onSave={handleSave}
        />
    </div>
}