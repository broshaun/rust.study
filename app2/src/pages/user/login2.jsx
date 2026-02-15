
import React, { useEffect, useReducer, useRef, useState, useTransition } from 'react'
import { useOutletContext, useNavigate, useLocation } from 'react-router-dom';
import { useLogin, useUser, useHttpClient } from 'hooks';
import { useLocalStorageState, useRequest } from 'ahooks';
import { Button, Login, Row, InputText2 } from "components";


export function LogOn() {
    // const navigate = useNavigate();
    // const location = useLocation();
    const [isPending, startTransition] = useTransition()
    const [account, setAccount] = useLocalStorageState('savedAccount')
    const [password, setPassword] = useState("")

    const { http } = useHttpClient('/api/chat/login/')
    const { setToken, setTime } = useLogin()
    const { user, setUser } = useUser()

    // const login = () => {
    //     if (phone === "") {
    //         msgFn('error', "请输入手机")
    //     } else if (password === "") {
    //         msgFn('error', "请输入密码")
    //     } else {
    //         http.requestBodyJson('POST', { 'email': phone, 'pass_word': password }).then((results) => {
    //             console.log('results', results)
    //             if (results.code === 200) {
    //                 setToken(results.data?.login_token)
    //                 setTime(results.data?.login_expired)
    //                 setUser(results.data?.user || {})
    //                 msgFn('success', "登陆成功")
    //             } else {
    //                 msgFn('error', results.message)
    //             }
    //         })
    //     }
    // }

    const { data, runAsync: runLogin } = useRequest((account, password) => {
        if (!account && !password) return '请输入账号或密码';
        console.log('email', account, '\npass_word', password)
        http.requestBodyJson('POST', { 'email': account, 'pass_word': password })
            .then((results) => {
                if (!results) return;
                const { code, message, data } = results
                if (code === 200) {
                    console.log('success', '登录成功');
                    setToken(results.data?.login_token)
                    setTime(results.data?.login_expired)

                } else console.log('error', message);
            })
        return 'ok'
    }, { manual: true })


    console.log("data: ", data)




    return <React.Fragment>
        <Login >
            <Login.Head title='登记界面' avatar='./favicon.png' />
            <Login.Input>
                <br />
                <InputText2 placeholder="请输入账号..." position="center" defaultValue={'77254@qq.com'} onChangeValue={(value) => { setAccount(value) }}>
                    <InputText2.Left icon="user-circle" />
                </InputText2>
                <br />
                <InputText2 type="password" placeholder="请输入密码..." position="center" onChangeValue={(value) => { setPassword(value) }}>
                    <InputText2.Left icon="lock-closed" />
                </InputText2>

            </Login.Input>
            <Login.Submit>
                <br/>
                <Row gap={60} align="center" justify="center">
                    <Button position="center" size={{ width: '33%', height: '42px' }} onClick={() => { runLogin(account, password) }}>登录</Button>
                    <Button position="center" size={{ width: '33%', height: '42px' }} onClick={() => { runLogin(account, password) }}>退出</Button>
                </Row>

            </Login.Submit>
        </Login>

    </React.Fragment>
}


    <Row size>
  
    </Row>



