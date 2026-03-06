import React, { useState } from 'react'
import { useHttpClient } from 'hooks';
import { useRequest } from 'ahooks';
import { Avatar, Modal } from "components";
import { Button, TextField, Row, SizedBox, Center, Divider } from 'components/flutter';


export function Register() {
    const [account, setAccount] = useState('')
    const [password, setPassword] = useState("")
    const { http } = useHttpClient('/api/chat/register/')
    const [open, setOpen] = useState(false);
    const [msg, setMsg] = useState('');

    const { data, runAsync: runLogin } = useRequest((account, password) => {
        if (!account || !password) {
            setMsg('请输入账号密码 ...')
            setOpen(true)
            return
        }

        http.requestBodyJson('PUT', { 'email': account, 'pass_word': password })
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
        <Center >
            <Avatar
                // src={src}
                size={60}
                shape="circle"
                fit='cover'
                borderColor="#e5e7eb"
                hasShadow={true}
            />
            <SizedBox height={20} />
            <h3>注册账号</h3>
            <SizedBox height={10} />
            <Divider indent={40} endIndent={40} color="#eeeeee" />
            <SizedBox height={40} />
            <Row >
                <Center>
                    <TextField
                        label="账号"
                        width="70%"
                        hintText="请输入账号"
                        value={account}
                        onChanged={(value) => setAccount(value)}
                    />
                </Center>
            </Row >
            <SizedBox height={5} />
            <Row>
                <Center>
                    <TextField
                        label="密码"
                        width="70%"
                        hintText="请输入密码"
                        obscureText={true}
                        value={password}
                        onChanged={(value) => setPassword(value)}
                    />
                </Center>
            </Row>
            <SizedBox height={10} />
            <Row >
                <Center>
                    <Button label='注册' width="70%"
                        onPressed={() => { runLogin(account, password) }}
                    />
                </Center>
            </Row>
        </Center>


    </React.Fragment >
}



