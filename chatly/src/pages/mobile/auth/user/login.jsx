import { Modal } from "components";
import React, { useMemo, useState } from "react";
import { useNavigate } from 'react-router';
import { useToken } from "utils";
import { useHttpClient, useImgApiBase } from 'utils';
import { SafeAvatar } from 'components'; // 保留了 SafeAvatar
import { useMutation } from '@tanstack/react-query';
import { useLocalStorage } from "@mantine/hooks";
import { Button, Stack, Center, Title, Divider } from "@mantine/core"; // 引入原生的 Divider
import { TextField } from "./UI/TextField";

export function Login() {
    const navigate = useNavigate();
    const [open, setOpen] = useState(false);
    const [msg, setMsg] = useState('');
    const [account, setAccount] = useLocalStorage({ key: 'current_account' });
    const [currentUser, setCurrentUser] = useLocalStorage({ key: 'current_user' });
    const [password, setPassword] = useState("");

    const { http } = useHttpClient('/rpc/chat/login/');
    const { joinPath } = useImgApiBase('avatar');
    const { setToken } = useToken();

    const avatar_url = useMemo(() => {
        return joinPath(currentUser?.avatar_url);
    }, [currentUser?.avatar_url]);

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
            setMsg(error?.message || "登录失败，请稍后重试");
            setOpen(true);
        },
    });

    return (
        <React.Fragment>
            <Stack>
                <Modal visible={open} onClose={() => setOpen(false)}>
                    <Modal.Title>登录提示</Modal.Title>
                    <Modal.Message>{msg}</Modal.Message>
                    <Modal.Confirm onClick={() => setOpen(false)}>确定</Modal.Confirm>
                </Modal>

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

                {/* 🔥 替换为具有两边渐变淡化效果的原生 Divider */}
                <Divider 
                    styles={{
                        root: {
                          border: 'none',
                          height: '1px',
                          // 通过 light-dark 自动适应明亮/暗色模式下的淡化颜色
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