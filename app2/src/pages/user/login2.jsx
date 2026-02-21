
import React, { useEffect, useReducer, useRef, useState, useTransition } from 'react'
import { useOutletContext, useNavigate, useLocation } from 'react-router-dom';
import { useLogin, useUser, useHttpClient } from 'hooks';
import { useLocalStorageState, useRequest } from 'ahooks';
import { Button, Login, Row, InputText2, Container, Avatar, Modal } from "components";


export function LogOn() {
    const navigate = useNavigate();
    // const location = useLocation();
    const [isPending, startTransition] = useTransition()
    const [account, setAccount] = useLocalStorageState('savedAccount')
    const [password, setPassword] = useState("")

    const { http } = useHttpClient('/api/chat/login/')
    const { setToken, setTime } = useLogin()
    const { user, setUser } = useUser()
    const [open, setOpen] = useState(false);
    const [msg, setMsg] = useState('');
    
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
                    navigate('/chat/dialog/')
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

        <Login>
            <Login.Head>
                <Container alignItems='center'>
                    <Avatar
                        src="./favicon.png"
                        alt="登记界面图标"
                        size={60}
                        shape="circle"
                        borderColor="#e5e7eb"
                        hasShadow={true}
                    />
                    <h3>登录界面</h3>
                </Container>
            </Login.Head>
            <Login.Input>
                <br />
                <Row align="center" justify="center">
                    <InputText2 placeholder="请输入账号..." position="center" defaultValue={'77254@qq.com'} onChangeValue={(value) => { setAccount(value) }}>
                        <InputText2.Left icon="user-circle" />
                    </InputText2>
                </Row>
                <br />
                <Row align="center" justify="center">
                    <InputText2 type="password" placeholder="请输入密码..." position="center" onChangeValue={(value) => { setPassword(value) }}>
                        <InputText2.Left icon="lock-closed" />
                    </InputText2>
                </Row>
            </Login.Input>
            <Login.Submit>
                <Row align="center" justify="center">
                    <Button position="center" size={{ width: '83%', height: '42px' }} onClick={() => { runLogin(account, password) }}>登录</Button>
                </Row>
            </Login.Submit>
        </Login>
    </React.Fragment>
}



