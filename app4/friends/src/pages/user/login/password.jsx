import React, { useEffect, useState, useReducer, useCallback } from "react";
import { InputText } from "components";
import { useOutletContext, useNavigate, useLocation } from 'react-router-dom';
import { useLogin } from 'hooks';


const showOnly = (items, showKeys = []) => items.map(item => ({ ...item, display: showKeys.includes(item.key) }))
const handleMenuClick = (state, action) => {
    let { items, current } = state
    if (current.has('target')) current.delete('target')
    if (current.has('method')) current.delete('method')
    switch (action?.click) {
        case 'init':
            if (action?.id) current.set('id', action.id)
            if (action?.from) current.set('from', action.from)
            items = showOnly(items, ['yes', 'no'])
            break
        case 'back':
            if (current.has('from')) current.set('target', current.get('from'));
            break
        case 'yes':
            current.set('method')
        case 'no':
            current.set('target', current.get('from'))
            break
    }
    return { items, current };
}

export function Password() {
    const navigate = useNavigate();
    const location = useLocation();
    const { msgFn, http, setItems } = useOutletContext();
    const { fnLogout } = useLogin();
    const [password1, setPassword1] = useState("")
    const [password2, setPassword2] = useState("")

    const updpwd = useCallback(() => {
        if (password1 === "") {
            msgFn('error', "请输入密码")
        } else if (password1 !== password2) {
            msgFn('error', "密码不同")
        } else {
            http.requestBodyJson('PUT', { 'pass_word': password1 })
                .then((results) => {
                    if (results.code === 200) {
                        msgFn('success', results.message)
                        fnLogout()
                    } else {
                        msgFn('error', results.message)
                    }
                })
        }
    }, [password1, password2])

    const initialState = {
        items: [
            { key: 'yes', permission: true, display: true, icon: { name: 'check-circle', color: 'green', lable: '确认' }, onClick: (key) => dispatch({ click: key }) },
            { key: 'no', permission: true, display: true, icon: { name: 'times-circle', color: 'red', lable: '取消' }, onClick: (key) => dispatch({ click: key }) },
        ],
        current: new Map()
    }

    const [state, dispatch] = useReducer(handleMenuClick, initialState)
    useEffect(() => {
        setItems(state.items)
        if (state.current.has('method')) {
            updpwd()
        }
        if (state.current.has('target')) {
            navigate(state.current.get('target'), { state: { from: location.pathname } })
        }
    }, [state])

    useEffect(() => {
        if (location.pathname === '/user/login/password/') {
            dispatch({ click: 'init', from: location.state?.from })
        }
    }, [location.pathname, location.state])


    return <React.Fragment>
        <InputText
            icon="key"
            type="password"
            placeholder="新密码"
            onChange={(e) => { setPassword1(e.target.value); }}
        />
        <br />
        <InputText
            type="password"
            icon="lock-closed"
            placeholder="确认密码"
            onChange={(e) => { setPassword2(e.target.value); }}
        />
    </React.Fragment>
}
