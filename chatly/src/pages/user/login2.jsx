
import { Modal } from "components";
import React, { useState } from "react"
import { useNavigate } from 'react-router';
import { useWinSize, useToken } from 'hooks';
import { useHttpClient2, useImage } from 'hooks/http';
import { Button, TextField, Divider, XBox, Avatar } from 'components/flutter';
import { useMutation } from '@tanstack/react-query'
import { useLocalStorage } from "@mantine/hooks";

// import { useCachedImage } from 'hooks/http/useImage2';






export function LogOn() {

    // const url = "http://103.186.108.161:5015/imgs/06e5b950405c65eadfe37d1a227fb170.jpg";
    // const { src, loading, error } = useCachedImage(url);
    // console.log('src',src)



    const navigate = useNavigate();
    const [open, setOpen] = useState(false);
    const [msg, setMsg] = useState('');
    const [account, setAccount] = useLocalStorage({ key: 'savedAccount' })
    const [avatar, setAvatar] = useLocalStorage({ key: 'myAvatar' })
    const [password, setPassword] = useState("")

    const { http } = useHttpClient2('/rpc/chat/login/')


    const { endpoint } = useHttpClient2('/imgs/')
    const { src: avatarSrc } = useImage(endpoint.join(avatar))
    
    console.log('avatarSrc', avatarSrc)


    const { setToken } = useToken()
    const { isMobile } = useWinSize()

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


        <div>{avatarSrc}</div>


        <Modal visible={open}>
            <Modal.Title>登录提示</Modal.Title>
            <Modal.Message>{msg}</Modal.Message>
            <Modal.Confirm onClick={() => setOpen(false)}>确定</Modal.Confirm>
        </Modal>

        <XBox align="middle" justify="center" compact width="100%">
            <Avatar
                src={avatarSrc}
                size={60}
                shape="circle"
                fit='cover'
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



