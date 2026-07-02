import { createHttpClient, currentModal } from 'utils';
import { RegisterUI } from "./ui/RegisterUI";
import { useRequest } from "ahooks";
import { LoadingOverlay } from "@mantine/core";


export function Register() {
    const { http } = createHttpClient('/rpc/chat/register/');
    async function register({ account, password }) {
        if (!account || !password) throw new Error("请输入账号密码...");
        const results = await http.requestBodyJson("PUT", {
            email: account,
            pass_word: password,
        });
        const { code, message } = results;
        if (code !== 200) throw new Error(message || "注册失败");
    }

    const { open, close } = currentModal();
    const { loading, runAsync } = useRequest(register, {
        manual: true,
        onSuccess: async () => {
            open({
                title: "注册提示",
                message: "账号注册成功！",
                onConfirm: close,
                onCancel: null,
            });
        },
        onError: async (error) => {
            open({
                title: "注册提示",
                message: error?.message || "注册失败",
                onConfirm: close,
                onCancel: null,
            });
        }
    });


    if (loading) {
        return <LoadingOverlay visible={loading} />
    }

    return (
        <RegisterUI
            loading={loading}
            onSubmit={runAsync}
        />
    );
}