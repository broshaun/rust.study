
import { Modal } from "components";
import React, { useMemo, useState } from "react"
import { useNavigate } from 'react-router';
import { useWinSize, useToken } from 'hooks';
import { useHttpClient2 } from 'hooks/http';
import { Button, TextField, Divider, XBox, SafeAvatar } from 'components/flutter';
import { useMutation } from '@tanstack/react-query'
import { useLocalStorage } from "@mantine/hooks";


export function LogOn() {
    const navigate = useNavigate();
    const [open, setOpen] = useState(false);
    const [msg, setMsg] = useState('');
    const [account, setAccount] = useLocalStorage({ key: 'savedAccount' })
    const [avatar, setAvatar] = useLocalStorage({ key: 'myAvatar' })
    const [password, setPassword] = useState("")

    const { http } = useHttpClient2('/rpc/chat/login/')
    const { endpoint } = useHttpClient2('/imgs/')
    const { setToken } = useToken()
    const { isMobile } = useWinSize()

    const avatar_url = useMemo(() => {
        return endpoint.join(avatar)
    }, [endpoint, avatar])


    const { mutateAsync: login } = useMutation(
        {
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
                setAvatar(data?.user?.avatar_url);
                setToken(data?.login_token, data?.login_expired);
                if (isMobile) {
                    navigate("/chat/mobile/dialog/");
                } else {
                    navigate("/chat/dialog/");
                }
            },
            onError: (error) => {
                setMsg(error?.message || "登录失败，请稍后重试");
                setOpen(true);
            },
        }
    );


    return <React.Fragment>

        <Modal visible={open}>
            <Modal.Title>登录提示</Modal.Title>
            <Modal.Message>{msg}</Modal.Message>
            <Modal.Confirm onClick={() => setOpen(false)}>确定</Modal.Confirm>
        </Modal>

        <XBox align="middle" justify="center" compact width="100%">
            <SafeAvatar
                url={avatar_url}
                size={75}
                radius={100}
                cover={true}
                autoUpdate
            />
        </XBox>

        <XBox padding={20}>
            <h3>登录界面</h3>
        </XBox>

        <Divider fade={true} thickness={1} opacity={0.3} />

        <XBox padding={5}>
            <TextField
                label="账号"
                maxWidth={250}
                hintText="请输入账号"
                value={account}
                onChanged={(value) => setAccount(value)}
            />
        </XBox>

        <XBox padding={5}>
            <TextField
                label="密码"
                maxWidth={250}
                hintText="请输入密码"
                obscureText={true}
                value={password}
                onChanged={(value) => { setPassword(value) }}
            />
        </XBox>

        <XBox padding={10}>
            <Button label='登录' width={250}
                onPressed={() => { login({ account, password }) }}
            />
        </XBox>

    </React.Fragment>
}



