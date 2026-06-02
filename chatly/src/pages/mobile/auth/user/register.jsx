import React, { useState } from "react";
import { useMutation } from '@tanstack/react-query';
import { useHttpClient, currentModal } from 'utils';
import { Button, Stack, Center, Title, Divider } from "@mantine/core";
import { TextField } from "./UI/TextField";

export function Register() {
    const [account, setAccount] = useState('');
    const [password, setPassword] = useState('');
    const { http } = useHttpClient('/rpc/chat/register/');

    const { open, close } = currentModal();
    const { mutateAsync: runLogin } = useMutation({
        mutationFn: async ({ account, password }) => {
            if (!account || !password) throw new Error("请输入账号密码 ...");
            const results = await http.requestBodyJson("PUT", { email: account, pass_word: password });
            if (!results) throw new Error("注册失败");
            const { code, message } = results;
            setAccount('');
            setPassword('');
            if (code !== 200) throw new Error(message || "登录失败");
            return results;
        },
        onSuccess: (data) =>{
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
        <React.Fragment>
            <Stack>

                <Center>
                    <Title order={3}>注册账号</Title>
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
                        onChanged={(value) => setPassword(value)}
                    />
                </Center>

                <Center>
                    <Button h={42} w={250} onClick={() => { runLogin({ account, password }) }} >注册</Button>
                </Center>
            </Stack>
        </React.Fragment>
    );
}