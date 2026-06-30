import React, { useState, useEffect } from "react"
import { useNavigate } from 'react-router';
import { tokenStore } from "utils";
import { createHttpClient, currentModal, useDateTime } from 'utils';
import { useLocalStorage } from "@mantine/hooks";
import { LoginUI } from "./ui/LoginUI";
import { userId, sessionId } from "utils/identity";
import { useAccountStorage } from "./hook/useAccountStorage";


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
    const { open, close } = currentModal();
    async function onLogin({ account, password }) {
        try {
            if (!account || !password) throw new Error("请输入账号密码 ...");
            const results = await http.requestBodyJson("POST", { email: account, pass_word: password });
            if (!results) throw new Error("登录失败，请稍后重试");
            const { code, data, message } = results;
            if (code !== 200) throw new Error(message);
            userId.set(account)
            sessionId.new()
            tokenStore.set({ "token": data?.login_token, "login_expired": data?.login_expired })
            setUser({ account, user: { ...data?.user, timestamp: dt.getDateTimeStr() } })
            navigate("/mobile/chat/");
            return data
        } catch (error) {
            open({
                title: "登录提示",
                message: error?.message || String(error),
                onConfirm: close,
                onCancel: null
            });
        }
    }

    return (
        <React.Fragment>
            <LoginUI
                avatarUrl={login?.avatar_url}
                avatarVersion={login?.timestamp}
                defaultAccount={account}
                onAccountChange={setAccount}
                onSubmit={onLogin}
            />
        </React.Fragment>
    );
}