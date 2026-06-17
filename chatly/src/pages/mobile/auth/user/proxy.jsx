import { apiBase, apiImgs, useHttpClient, currentModal } from "utils";
import { useMutation } from '@tanstack/react-query';
import { ProxySetting } from "./ui/ProxySetting";

export const Proxy = () => {
    const { open, close } = currentModal();
    const { http } = useHttpClient('/rpc/chat/ping/');
    const { mutateAsync: ping } = useMutation({
        mutationFn: async () => {
            const results = await http.requestBodyJson("get", {});
            const { code, data, message } = results;
            if (code !== 200) {
                throw new Error(message);
            }
            return data
        },
        onSuccess: (data) => {
            open({
                title: "Ping测试",
                message: data,
                onConfirm: () => close(),
                onCancel: null
            });
        },
        onError: (error) => {
            open({
                title: "Ping测试",
                message: error,
                onConfirm: () => close(),
                onCancel: null
            });
        },
    });

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
            onPingApi={() => { ping().catch(console.error) }}
            onSave={handleSave}
        />
    </div>
}