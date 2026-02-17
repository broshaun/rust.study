
import React, { useEffect, useReducer, useRef, useState, useTransition } from 'react'
import { useOutletContext, useNavigate, useLocation } from 'react-router-dom';
import { useLogin, useUser, useHttpClient } from 'hooks';
import {  useRequest } from 'ahooks';
import { Button, Login, Row, InputText2, Container, Avatar, Modal } from "components";


export function Register() {
    const navigate = useNavigate();
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
            <Modal.Confirm onClick={()=>setOpen(false)}>确定</Modal.Confirm>
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
                    <h3>注册界面</h3>
                </Container>
            </Login.Head>
            <Login.Input>
                <br />
                <Row gap={60} align="center" justify="center">
                    <InputText2 placeholder="注册账号..." position="center" value={account} onChangeValue={(value) => { setAccount(value) }}>
                        <InputText2.Left icon="user-circle" />
                    </InputText2>
                </Row>
                <br />
                <Row gap={60} align="center" justify="center">
                    <InputText2 type="password" placeholder="账号密码..." position="center" value={password} onChangeValue={(value) => { setPassword(value) }}>
                        <InputText2.Left icon="lock-closed" />
                    </InputText2>
                </Row>
            </Login.Input>
            <Login.Submit>
                <br />
                <Row gap={60} align="center" justify="center">
                    <Button position="center" size={{ width: '83%', height: '42px' }} onClick={() => { runLogin(account, password) }}>注册</Button>
                    {/* <Button position="center" size={{ width: '33%', height: '42px' }} onClick={() => { navigate('/user/login/') }}>返回</Button> */}
                </Row>
            </Login.Submit>
        </Login>

    </React.Fragment>
}



