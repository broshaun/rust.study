import React from "react";
import { useMutation } from '@tanstack/react-query';
import { useHttpClient, currentModal } from 'utils';
import { RegisterUI } from "./ui/RegisterUI";

export function Register() {
    const { http } = useHttpClient('/rpc/chat/register/');
    const { open, close } = currentModal();


    const { mutateAsync: runRegister, isPending } = useMutation({
        mutationFn: async ({ account, password }) => {
            if (!account || !password) throw new Error("请输入账号密码 ...");
            const results = await http.requestBodyJson("PUT", { email: account, pass_word: password });
            if (!results) throw new Error("注册失败");
            const { code, message } = results;
            if (code !== 200) throw new Error(message || "注册失败"); 
            return results;
        },
        onSuccess: () => {
            open({
                title: "注册提示",
                message: "账号注册成功！",
                onConfirm: () => close(),
                onCancel: null
            });
        },
        onError: (error) => {
            open({
                title: "注册提示",
                message: error?.message || "注册失败",
                onConfirm: () => close(),
                onCancel: null
            });
        }
    });

    return (
        <RegisterUI 
            loading={isPending} 
            onSubmit={runRegister} 
        />
    );
}