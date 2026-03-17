import React, { useState } from "react"
import { useRequest } from 'ahooks';
import { Modal } from "components";
import { useHttpClient2 } from 'hooks/http';
import { Button, TextField, Divider, Avatar, XBox } from 'components/flutter';


export function Register() {
    const [account, setAccount] = useState('')
    const [password, setPassword] = useState("")
    const { http, endpoint } = useHttpClient2('/rpc/chat/login/')
    const [open, setOpen] = useState(false);
    const [msg, setMsg] = useState('');

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
                    setMsg(message)
                    setOpen(true)
                    setAccount('')
                    setPassword('')
                } else {
                    setMsg(message)
                    setOpen(true)
                    setAccount('')
                    setPassword('')
                }
            })
        return 'ok'
    }, { manual: true })




    return <React.Fragment>
        <Modal visible={open}>
            <Modal.Title>注册提示</Modal.Title>
            <Modal.Message>{msg}</Modal.Message>
            <Modal.Confirm onClick={() => setOpen(false)}>确定</Modal.Confirm>
        </Modal>

        <XBox>
            <Avatar
                size={60}
                shape="circle"
                fit='cover'
                borderColor="#e5e7eb"
                hasShadow={true}
            />
        </XBox>

        <XBox padding={20}>
            <h3>注册账号</h3>
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
            <Button label='注册' width={250}
                onPressed={() => { runLogin(account, password) }}
            />
        </XBox>

    </React.Fragment >
}



