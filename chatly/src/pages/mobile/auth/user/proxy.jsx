import { useApiBase, useImgApiBase, useHttpClient, currentModal, useDateTime } from "utils";
import { useLocalStorage } from "@mantine/hooks";
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




    const {apiBase, setApiBase} = useApiBase() //http://185.245.41.154:5015
    const {imgBase, setImgBase} = useImgApiBase() // http://185.245.41.154:9000


    console.log('apiBase', apiBase)
    console.log('imgBase', imgBase)

    return <div>
        <ProxySetting
            apiBase={apiBase}
            imgBase={imgBase}
            onPingApi={async (url) => {
                ping()
            }}
            onSave={(newApi, newImg) => {
                setApiBase(newApi);
                setImgBase(newImg);
                console.log('新配置：', newApi, newImg);
            }}
        />
    </div>
}