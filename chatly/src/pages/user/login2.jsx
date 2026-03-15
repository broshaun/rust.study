
import { Modal } from "components";
import React, { useState,useCallback } from 'react'
import { useNavigate } from 'react-router-dom';
import { useWinSize ,useToken} from 'hooks';
import { useLocalStorageState, useRequest } from 'ahooks';
import { useImage, useHttpClient2 } from 'hooks/http';
import { Button, TextField, Divider, XBox, Avatar } from 'components/flutter';


export function LogOn() {

    const navigate = useNavigate();
    const [account, setAccount] = useLocalStorageState('savedAccount')
    const [avatar, setAvatar] = useLocalStorageState('myAvatar')

    const [password, setPassword] = useState("")
    const { http } = useHttpClient2('/rpc/chat/login/')

    

    const { avatarSrc } = useImage("/imgs", avatar)
    const { setToken } = useToken()
    const [open, setOpen] = useState(false);
    const [msg, setMsg] = useState('');
    const { isMobile } = useWinSize()

    const { data, runAsync: runLogin } = useRequest((account, password) => {
        if (!account || !password) {
            setMsg('请输入账号密码 ...')
            setOpen(true)
            return
        }

        http.post('POST', { 'email': account, 'pass_word': password })
            .then((results) => {
                if (!results) return;
                const { code, message, data } = results
                if (code === 200) {
                    setToken(results.data?.login_token, results.data?.login_expired)
                    setAvatar(data?.user?.avatar_url)

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

        <XBox>
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



