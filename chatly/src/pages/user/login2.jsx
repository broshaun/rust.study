
import { Avatar, Modal } from "components";
import React, { useState } from 'react'
import { useNavigate } from 'react-router-dom';
import { useLogin, useHttpClient, useWinSize } from 'hooks';
import { useLocalStorageState, useRequest } from 'ahooks';
import { useImage, useHttpClient2 } from 'hooks/http';
import { Button, TextField, Row, SizedBox, Center, Divider, AppShell, Container, Padding } from 'components/flutter';


export function LogOn() {

    const navigate = useNavigate();
    const [account, setAccount] = useLocalStorageState('savedAccount')
    const [avatar, setAvatar] = useLocalStorageState('saveOneself')
    const { src } = useImage("/imgs", avatar)
    const [password, setPassword] = useState("")
    // const { http } = useHttpClient('/api/chat/login/')
    const { http, endpoint } = useHttpClient2('/rpc/chat/login/')
    const { setToken, setTime } = useLogin()
    const [open, setOpen] = useState(false);
    const [msg, setMsg] = useState('');
    const { isMobile } = useWinSize()

    const { data, runAsync: runLogin } = useRequest((account, password) => {
        if (!account || !password) {
            setMsg('请输入账号密码 ...')
            setOpen(true)
            return
        }

        // http.requestBodyJson('POST', { 'email': account, 'pass_word': password })
        http.post('POST', { 'email': account, 'pass_word': password })
            .then((results) => {
                if (!results) return;
                const { code, message, data } = results
                if (code === 200) {
                    setToken(results.data?.login_token)
                    setTime(results.data?.login_expired)
                    isMobile ? navigate('/chat/mobile/dialog/') : navigate('/chat/dialog/')
                    setAvatar(data?.user?.avatar_url)
                } else {
                    setMsg(message)
                    setOpen(true)
                }
            })
        return 'ok'
    }, { manual: true })

    return <React.Fragment>
        {/* <Modal visible={open}>
            <Modal.Title>登录提示</Modal.Title>
            <Modal.Message>{msg}</Modal.Message>
            <Modal.Confirm onClick={() => setOpen(false)}>确定</Modal.Confirm>
        </Modal> */}

        <Center>
            <Avatar
                src={src}
                size={60}
                shape="circle"
                fit='cover'
                borderColor="#e5e7eb"
                hasShadow={true}
            />

            <SizedBox height={20} />
            <h3>登录界面</h3>
            <SizedBox height={20} />
            <Divider fade={true} thickness={1} opacity={0.3} />
            <SizedBox height={30} />

            <Row>
                <Padding value={5}>
                    <TextField
                        label="账号"
                        hintText="请输入账号"
                        value={account}
                        onChanged={(value) => setAccount(value)}
                    />
                </Padding>
            </Row >

            <Row>
                <Padding value={5}>
                    <TextField
                        label="密码"
                        hintText="请输入密码"
                        obscureText={true}
                        value={password}
                        onChanged={(value) => setPassword(value)}
                    />
                </Padding>
            </Row>

            <Row>
                <Padding value={15}>
                    <Button label='登录' width={235}
                        onPressed={() => { runLogin(account, password) }}
                    />
                </Padding>

            </Row>
        </Center>





    </React.Fragment>
}



