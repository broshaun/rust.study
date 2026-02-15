
import React, { useEffect, useReducer, useRef, useState } from 'react'
import { useOutletContext, useNavigate, useLocation } from 'react-router-dom';
import { useLogin, useUser } from 'hooks';
import { useLocalStorageState } from 'ahooks';
import { Button, Login, InputText, InputText2 } from "components";


export function LogOn() {
    // const navigate = useNavigate();
    // const location = useLocation();
    // const [phone, setPhone] = useLocalStorageState('savedPhone')
    // const [password, setPassword] = useState("")
    // const refState = useRef(new Map())

    // const { setToken, setTime } = useLogin()
    // const { user, setUser } = useUser()

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

    // const initialState = {
    //     items: [
    //         { key: 'yes', permission: true, display: true, icon: { name: 'check-circle', color: 'green', lable: '确认' }, onClick: (key) => dispatch({ click: key }) },
    //         { key: 'no', permission: true, display: true, icon: { name: 'times-circle', color: 'red', lable: '取消' }, onClick: (key) => dispatch({ click: key }) },
    //     ],
    //     count: 0
    // }
    // const handleMenuClick = (state, action) => {
    //     let { items, count } = state
    //     if (refState.current.has('target')) refState.current.delete('target');
    //     switch (action?.click) {
    //         case 'init':
    //             items = showOnly(items, ['yes', 'no'])
    //             break
    //         case 'yes':
    //             login()
    //         case 'no':
    //             refState.current.set('target', refState.current.get('from'))
    //             break
    //     }
    //     return { items, count: count + 1 };
    // }
    // const [state, dispatch] = useReducer(handleMenuClick, initialState)
    // useEffect(() => {
    //     setItems(state.items)
    //     if (refState.current.has('target')) {
    //         navigate(refState.current.get('target'), { state: { from: location.pathname } })
    //     }
    // }, [state])
    // useEffect(() => {
    //     if (location.state?.from) refState.current.set('from', location.state.from);
    //     if (location.pathname === '/user/login/logon/') {
    //         dispatch({ click: 'init' })
    //     }
    // }, [location.pathname])


    return <React.Fragment>
        <Login >
            <Login.Head title='登记界面' avatar='./favicon.png' />
            <Login.Input>
                {/* <br />
                <InputText
                    icon="user-circle"
                    placeholder="手机"
                    // defaultValue={}
                    onChange={(e) => { }}
                />
                <br />
                <br />
                <InputText
                    icon="lock-closed"
                    type="password"
                    placeholder="密码"
                    onChange={(e) => { }}
                />
                <br /> */}

                <InputText2 placeholder="请输入账号..." position="center" defaultValue={'77254@qq.com'}>
                    <InputText2.Left icon="user-circle" />
                </InputText2>
                <br />

                <InputText2 type="password" placeholder="请输入密码..." position="center">
                    <InputText2.Left icon="lock-closed" />
                </InputText2>

            </Login.Input>
            <Login.Submit>
                <Button>按钮</Button>


            </Login.Submit>
        </Login>

    </React.Fragment>
}




