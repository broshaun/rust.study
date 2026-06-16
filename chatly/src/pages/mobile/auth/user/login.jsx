import React, { useState } from "react";
import { useNavigate } from 'react-router';
import { useToken } from "utils";
import { useHttpClient, currentModal, useDateTime } from 'utils';
import { useMutation } from '@tanstack/react-query';
import { useLocalStorage } from "@mantine/hooks";
import { LoginUI } from "./ui/LoginUI";
import { useLoginUserInfo } from "http/login";


export function Login() {
    const navigate = useNavigate();
    const [account, setAccount] = useLocalStorage({ key: 'current_account', defaultValue: "" });
    const [currentUser, setCurrentUser] = useLocalStorage({ key: 'current_user' });

    const { http } = useHttpClient('/rpc/chat/login/');
    const { setToken } = useToken();
    const dt = useDateTime();

    const { open, close } = currentModal();
    const { mutateAsync: login } = useMutation({
        mutationFn: async ({ account, password }) => {
            if (!account || !password) throw new Error("请输入账号密码 ...");
            const results = await http.post("POST", { email: account, pass_word: password });
            if (!results) throw new Error("登录失败，请稍后重试");
            const { code, data, message } = results;
            if (code !== 200) throw new Error(message || "登录失败");
            useLoginUserInfo()
            return data
        },
        onSuccess: (data) => {
            setToken(data?.login_token, data?.login_expired);
            setCurrentUser({ ...data?.user, timestamp: dt.getDateTimeStr() });
            navigate("/mobile/chat/");
        },
        onError: (error) => {
            open({
                title: "登录提示",
                message: error?.message || "登录失败，请稍后重试",
                onConfirm: () => close(),
                onCancel: null
            });
        },
    });

    return (
        <React.Fragment>
            <LoginUI
                avatarUrl={currentUser?.avatar_url}
                avatarVersion={currentUser?.timestamp}
                defaultAccount={account}
                onAccountChange={setAccount}
                onSubmit={login}
            />
        </React.Fragment>
    );
}