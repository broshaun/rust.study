
import { Modal } from "components";
import React, { useState } from "react"
import { useNavigate } from 'react-router';
import { useWinSize, useToken } from 'hooks';
import { useRequest } from 'ahooks';
import { useHttpClient2, useImage } from 'hooks/http';
import { Button, TextField, Divider, XBox, Avatar } from 'components/flutter';
import { useLocalStorage } from "hooks";


export function LogOn() {

    const navigate = useNavigate();
    const [open, setOpen] = useState(false);
    const [msg, setMsg] = useState('');
    const [account, setAccount] = useLocalStorage('savedAccount')
    const [avatar, setAvatar] = useLocalStorage('myAvatar')
    const [password, setPassword] = useState("")

    const { http } = useHttpClient2('/rpc/chat/login/')
    const { src: avatarSrc } = useImage(avatar)

    // console.log('avatar', avatar)
    // console.log('avatarSrc', avatarSrc)

    const { setToken } = useToken()
    const { isMobile } = useWinSize()
    const { data, runAsync: runLogin } = useRequest((account, password) => {

        if (!account || !password) {
            setMsg('请输入账号密码 ...')
            setOpen(true)
            return
        }

        http.post('POST', { 'email': account, 'pass_word': password })
            .then((results) => {
                const { code, message, data } = results
                if (!results) return;
                if (code === 200) {
                    setAvatar(data?.user?.avatar_url)
                    setToken(results.data?.login_token, results.data?.login_expired)
                    isMobile ? navigate('/chat/mobile/dialog/') : navigate('/chat/dialog/')
                    
                } else {
                    setMsg(message)
                    setOpen(true)
                }
            })
        return 'ok'
    }, { manual: true })




    return <React.Fragment>
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
                onChanged={(value) => setPassword(value)}
            />
        </XBox>

        <XBox padding={10}>
            <Button label='登录' width={250}
                onPressed={() => { runLogin(account, password) }}
            />
        </XBox>

    </React.Fragment>
}



