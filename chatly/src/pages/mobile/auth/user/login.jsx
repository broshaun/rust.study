import React, { useState, useEffect, Suspense } from "react"
import { useNavigate } from 'react-router';
import { tokenStore } from "utils";
import { createHttpClient, currentModal, useDateTime } from 'utils';
import { useLocalStorage } from "@mantine/hooks";
import { LoginUI } from "./ui/LoginUI";
import { userId } from "utils/identity";
import { useAccountStorage } from "./hook/useAccountStorage";
import { useRequest } from "ahooks";
import { LoadingOverlay } from "@mantine/core";



export function Login() {
    const dt = useDateTime();
    const navigate = useNavigate();
    const [account, setAccount] = useLocalStorage({ key: 'current_account', defaultValue: "" });
    const { setUser, getUser } = useAccountStorage();

    const [login, setLogin] = useState({})
    useEffect(() => {
        const user = getUser(account)
        setLogin(user)
    }, [account])

    const { http } = createHttpClient('/rpc/chat/login/');
    async function onLogin({ account, password }) {
        if (!account || !password) throw new Error("请输入账号密码 ...");
        const results = await http.requestBodyJson("POST", { email: account, pass_word: password });
        const { code, data, message } = results;
        if (code !== 200) throw new Error(message);
        return data
    }

    const { open, close } = currentModal();
    const { loading, runAsync } = useRequest(onLogin, {
        manual: true,
        onSuccess: async (data) => {
            userId.set(account)
            tokenStore.set({ "token": data?.login_token, "login_expired": data?.login_expired })
            setUser({ account, user: { ...data?.user, timestamp: dt.getDateTimeStr() } })
            navigate("/mobile/chat/");
        },
        onError: async (error) => {
            open({
                title: "登录提示",
                message: error?.message || String(error),
                onConfirm: close,
                onCancel: null
            });
        }
    });



    if (loading) {
        return <LoadingOverlay visible={loading} />
    }

    return (
        <React.Fragment>
            <LoginUI
                avatarUrl={login?.avatar_url}
                avatarVersion={login?.timestamp}
                defaultAccount={account}
                onAccountChange={setAccount}
                onSubmit={(value) => runAsync(value)}
            />
        </React.Fragment>
    );
}