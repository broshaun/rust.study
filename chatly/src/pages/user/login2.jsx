import { Button, TextField, Row, SizedBox, Center, Divider } from 'components/flutter';
import { Avatar, Modal } from "components";
import React, { useState } from 'react'
import { useNavigate } from 'react-router-dom';
import { useLogin, useHttpClient, useWinWidth } from 'hooks';
import { useLocalStorageState, useRequest } from 'ahooks';
import { useImage } from 'hooks/http';



export function LogOn() {

    const navigate = useNavigate();
    const [account, setAccount] = useLocalStorageState('savedAccount')
    const [avatar, setAvatar] = useLocalStorageState('saveOneself')
    const { src } = useImage("/imgs", avatar)
    const [password, setPassword] = useState("")
    const { http } = useHttpClient('/api/chat/login/')
    const { setToken, setTime } = useLogin()
    const [open, setOpen] = useState(false);
    const [msg, setMsg] = useState('');
    const { isMobile } = useWinWidth()

    const { data, runAsync: runLogin } = useRequest((account, password) => {
        if (!account || !password) {
            setMsg('请输入账号密码 ...')
            setOpen(true)
            return
        }

        http.requestBodyJson('POST', { 'email': account, 'pass_word': password })
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
        <Modal visible={open}>
            <Modal.Title>登录提示</Modal.Title>
            <Modal.Message>{msg}</Modal.Message>
            <Modal.Confirm onClick={() => setOpen(false)}>确定</Modal.Confirm>
        </Modal>

        <Center >
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
            <SizedBox height={10} />
            <Divider indent={40} endIndent={40} color="#eeeeee" />
            <SizedBox height={40} />
            <Row mainAxisAlignment="center">
                <TextField
                    label="账号"
                    width="70%"
                    hintText="请输入账号"
                    value={account}
                    onChanged={(value) => setAccount(value)}
                />
            </Row >
            <SizedBox height={5} />
            <Row mainAxisAlignment="center">
                <TextField
                    label="密码"
                    width="70%"
                    hintText="请输入密码"
                    obscureText={true}
                    value={password}
                    onChanged={(value) => setPassword(value)}
                />
            </Row>
            <SizedBox height={10} />
            <Row mainAxisAlignment="center" >
                <Button label='登录' width="70%"
                    onPressed={() => { runLogin(account, password) }}
                />
            </Row>
        </Center>
    </React.Fragment>
}



