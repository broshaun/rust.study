import React, { useEffect, useReducer, useRef, useState } from 'react'
import { InputText } from "components";
import { useOutletContext, useNavigate, useLocation } from 'react-router-dom';
import { useLogin, useUser } from 'hooks';
import { useLocalStorageState } from 'ahooks';


export function LogOn() {
    const navigate = useNavigate();
    const location = useLocation();
    const [phone, setPhone] = useLocalStorageState('savedPhone')
    // const [usrInfo, setUsrInfo] = useLocalStorageState('usrInfo')
    const [password, setPassword] = useState("")
    const refState = useRef(new Map())
    const { msgFn, http, setItems, showOnly } = useOutletContext();
    const { setToken, setTime } = useLogin()
    const { user, setUser } = useUser()

    const login = () => {
        if (phone === "") {
            msgFn('error', "请输入手机")
        } else if (password === "") {
            msgFn('error', "请输入密码")
        } else {
            http.requestBodyJson('POST', { 'phone': phone, 'pass_word': password }).then((results) => {
                console.log('results', results)
                if (results.code === 200) {
                    setToken(results.data?.login_token)
                    setTime(results.data?.login_expired)
                    setUser(results.data?.user || {})
                    // setUsrInfo(results.data?.user || {})

                    msgFn('success', "登陆成功")
                } else {
                    msgFn('error', results.message)
                }
            })
        }
    }

    const initialState = {
        items: [
            { key: 'yes', permission: true, display: true, icon: { name: 'check-circle', color: 'green', lable: '确认' }, onClick: (key) => dispatch({ click: key }) },
            { key: 'no', permission: true, display: true, icon: { name: 'times-circle', color: 'red', lable: '取消' }, onClick: (key) => dispatch({ click: key }) },
        ],
        count: 0
    }
    const handleMenuClick = (state, action) => {
        let { items, count } = state
        if (refState.current.has('target')) refState.current.delete('target');
        switch (action?.click) {
            case 'init':
                items = showOnly(items, ['yes', 'no'])
                break
            case 'yes':
                login()
            case 'no':
                refState.current.set('target', refState.current.get('from'))
                break
        }
        return { items, count: count + 1 };
    }
    const [state, dispatch] = useReducer(handleMenuClick, initialState)
    useEffect(() => {
        setItems(state.items)
        if (refState.current.has('target')) {
            navigate(refState.current.get('target'), { state: { from: location.pathname } })
        }
    }, [state])
    useEffect(() => {
        if (location.state?.from) refState.current.set('from', location.state.from);
        if (location.pathname === '/user/login/logon/') {
            dispatch({ click: 'init' })
        }
    }, [location.pathname])







    return <React.Fragment>
        <InputText
            icon="user-circle"
            placeholder="手机"
            defaultValue={phone}
            onChange={(e) => { setPhone(e.target.value); }}
        />
        <br />
        <InputText
            icon="lock-closed"
            type="password"
            placeholder="密码"
            onChange={(e) => { setPassword(e.target.value); }}
        />
    </React.Fragment>
}
