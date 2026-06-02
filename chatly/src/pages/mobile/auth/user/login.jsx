import React, { useMemo, useState } from "react";
import { useNavigate } from 'react-router';
import { useToken } from "utils";
import { useHttpClient, useImgApiBase, currentModal } from 'utils';
import { SafeAvatar } from 'components';
import { useMutation } from '@tanstack/react-query';
import { useLocalStorage } from "@mantine/hooks";
import { Button, Stack, Center, Title, Divider } from "@mantine/core";
import { TextField } from "./UI/TextField";

export function Login() {
    const navigate = useNavigate();
    const [account, setAccount] = useLocalStorage({ key: 'current_account', defaultValue: "" });
    const [currentUser, setCurrentUser] = useLocalStorage({ key: 'current_user' });
    const [password, setPassword] = useState("");

    const { http } = useHttpClient('/rpc/chat/login/');
    const { joinPath } = useImgApiBase('avatar');
    const { setToken } = useToken();

    const avatar_url = useMemo(() => {
        return joinPath(currentUser?.avatar_url);
    }, [currentUser?.avatar_url]);

    const { open, close } = currentModal();
    const { mutateAsync: login } = useMutation({
        mutationFn: async ({ account, password }) => {
            if (!account || !password) throw new Error("请输入账号密码 ...");
            const results = await http.post("POST", { email: account, pass_word: password });
            if (!results) throw new Error("登录失败，请稍后重试");
            const { code, message } = results;
            if (code !== 200) throw new Error(message || "登录失败");
            return results;
        },
        onSuccess: (results) => {
            const { data } = results;
            setToken(data?.login_token, data?.login_expired);
            setCurrentUser(data?.user);
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
            <Stack>

                <Center>
                    <SafeAvatar
                        url={avatar_url}
                        size={75}
                        radius={100}
                        cover={true}
                        autoUpdate
                    />
                </Center>

                <Center>
                    <Title order={4}>登录界面</Title>
                </Center>

                <Divider
                    styles={{
                        root: {
                            border: 'none',
                            height: '1px',
                            backgroundImage: 'linear-gradient(to right, transparent, light-dark(rgba(0,0,0,0.12), rgba(255,255,255,0.15)) 50%, transparent)'
                        }
                    }}
                />

                <Center>
                    <TextField
                        label="账号"
                        maxWidth={250}
                        hintText="请输入账号"
                        value={account}
                        onChanged={(value) => setAccount(value)}
                    />
                </Center>

                <Center>
                    <TextField
                        label="密码"
                        maxWidth={250}
                        hintText="请输入密码"
                        obscureText={true}
                        value={password}
                        onChanged={(value) => { setPassword(value) }}
                    />
                </Center>

                <Center>
                    <Button h={42} w={250} onClick={() => { login({ account, password }) }} >登录</Button>
                </Center>
            </Stack>
        </React.Fragment>
    );
}