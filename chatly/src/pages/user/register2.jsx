import React, { useState } from 'react'
// import { useHttpClient } from 'hooks';
import { useRequest } from 'ahooks';
import { Avatar, Modal } from "components";
import { Button, TextField, Row, SizedBox, Center, Divider ,Padding} from 'components/flutter';
import {  useHttpClient2 } from 'hooks/http';


export function Register() {
    const [account, setAccount] = useState('')
    const [password, setPassword] = useState("")
    // const { http } = useHttpClient('/api/chat/register/')
    const { http, endpoint } = useHttpClient2('/rpc/chat/login/')
    const [open, setOpen] = useState(false);
    const [msg, setMsg] = useState('');

    const { data, runAsync: runLogin } = useRequest((account, password) => {
        if (!account || !password) {
            setMsg('请输入账号密码 ...')
            setOpen(true)
            return
        }

        // http.requestBodyJson('PUT', { 'email': account, 'pass_word': password })
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
            <SizedBox height={20} />
            <Divider fade={true} thickness={1} opacity={0.3} />
            <SizedBox height={30} />
            <Row >

                <TextField
                    label="账号"
                    maxWidth={250}
                    hintText="请输入账号"
                    value={account}
                    onChanged={(value) => setAccount(value)}
                />

            </Row >
            <SizedBox height={5} />
            <Row>

                <TextField
                    label="密码"
                    maxWidth={250}
                    hintText="请输入密码"
                    obscureText={true}
                    value={password}
                    onChanged={(value) => setPassword(value)}
                />

            </Row>
            <SizedBox height={10} />
            <Row >
                <Padding value={15}>
                    <Center>
                        <Button label='注册' width={250}
                            onPressed={() => { runLogin(account, password) }}
                        />
                    </Center>
                </Padding>
            </Row>
        </Center>


    </React.Fragment >
}



