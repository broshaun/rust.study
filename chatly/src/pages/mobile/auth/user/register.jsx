import React, { useState } from "react";
import { useMutation } from '@tanstack/react-query';
import { Modal } from "components"; // 依然是那套像素级复刻的 iOS 质感弹窗
import { useHttpClient } from 'utils';
import { Button, Stack, Center, Title, Divider } from "@mantine/core"; // 引入原生的 Divider
import { TextField } from "./UI/TextField";

export function Register() {
    const [account, setAccount] = useState('');
    const [password, setPassword] = useState("");
    const { http } = useHttpClient('/rpc/chat/register/');
    const [open, setOpen] = useState(false);
    const [msg, setMsg] = useState('');

    const { mutateAsync: runLogin } = useMutation({
        mutationFn: async ({ account, password }) => {
            if (!account || !password) throw new Error("请输入账号密码 ...");
            const results = await http.requestBodyJson("PUT", { email: account, pass_word: password });
            if (!results) throw new Error("注册失败");
            const { code, message } = results;
            
            // 无论成功还是失败，都清空输入框并弹出提示
            setMsg(message);
            setOpen(true);
            setAccount('');
            setPassword('');
            
            return results;
        },
        onError: (error) => {
            setMsg(error?.message || "注册失败");
            setOpen(true);
        }
    });

    return (
        <React.Fragment>
            <Stack>
                {/* 提示框 */}
                <Modal visible={open} onClose={() => setOpen(false)}>
                    <Modal.Title>注册提示</Modal.Title>
                    <Modal.Message>{msg}</Modal.Message>
                    <Modal.Confirm onClick={() => setOpen(false)}>确定</Modal.Confirm>
                </Modal>

                <Center>
                    <Title order={3}>注册账号</Title>
                </Center>

                {/* 🔥 替换为具有两边渐变淡化效果的原生 Divider */}
                <Divider 
                    styles={{
                        root: {
                            border: 'none',
                            height: '1px',
                            // 完美的中间微实、向两端自然隐退的线性渐变，完美兼容白天与暗色模式
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