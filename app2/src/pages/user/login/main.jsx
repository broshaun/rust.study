import React, { useEffect, useReducer, useState } from 'react'
import { Outlet, useNavigate, useLocation } from "react-router-dom";
import { useMsg, useLogin, useHttpClient } from 'hooks';
import { MenuBar } from 'components';


const showOnly = (items, showKeys = []) => items.map(item => ({ ...item, display: showKeys.includes(item.key) }))
const handleMenuClick = (state, action) => {
    let { items, current } = state
    if (action?.from) current.set('from', action.from)
    if (current.has('target')) current.delete('target')
    if (current.has('method')) current.delete('method')

    switch (action?.click) {
        case 'init':
            items = action?.isLogged
                ? showOnly(items, ['info', 'password', 'logout'])
                : showOnly(items, ['logon', 'register']);
            break
        case 'back':
            if (current.has('from')) current.set('target', current.get('from'));
            break
        case 'logon':
            current.set('target', '/user/login/logon/')
            break
        case 'register':
            current.set('target', '/user/register/add/')
            break
        case 'info':
            current.set('target', '/user/login/info/')
            items = showOnly(items, ['back']);
            break
        case 'password':
            current.set('target', '/user/login/password/')
            break
        case 'logout':
            current.set('target', '/user/login/logout/')
            break
    }
    return { items, current };
}


export default function Login() {
    const { http } = useHttpClient('/api/chat/login/')
    const navigate = useNavigate();
    const location = useLocation();
    const { msg, msgFn } = useMsg();
    const { isLogged, loginToken } = useLogin();
    const [items, setItems] = useState()


    const initialState = {
        items: [
            { key: 'back', display: true, icon: { name: 'arrow-left-end-on-rectangle', lable: '返回' }, onClick: (key) => dispatch({ click: key }) },
            { key: 'logon', display: false, icon: { name: 'user', lable: '登陆' }, onClick: (key) => dispatch({ click: key }) },
            { key: 'register', display: false, icon: { name: 'user-plus', lable: '注册' }, onClick: (key) => dispatch({ click: key }) },
            { key: 'info', display: false, icon: { name: 'id-card', lable: '信息' }, onClick: (key) => dispatch({ click: key }) },
            { key: 'password', display: false, icon: { name: 'key', lable: '密码' }, onClick: (key) => dispatch({ click: key }) },
            { key: 'logout', display: false, icon: { name: 'logout', lable: '登出' }, onClick: (key) => dispatch({ click: key }) },
            { key: 'yes', display: false, icon: { name: 'check-circle', color: 'green', lable: '确认' }, onClick: (key) => dispatch({ click: key }) },
            { key: 'no', display: false, icon: { name: 'times-circle', color: 'red', lable: '取消' }, onClick: (key) => dispatch({ click: key }) },
        ],
        current: new Map()
    }

    const [state, dispatch] = useReducer(handleMenuClick, initialState)
    useEffect(() => {
        setItems(state.items)
        if (state.current.has('target')) {
            navigate(state.current.get('target'), { 'state': { from: location.pathname } })
        }
    }, [state])

    useEffect(() => {
        if (location.pathname === '/user/login/') {
            dispatch({ click: 'init', isLogged, from: location.state?.from })
        } else if (location.pathname === '/user/login/info/') {
            dispatch({ from: '/user/login/' })
        }
    }, [location.pathname, location.state, isLogged])


    return <React.Fragment>
        <MenuBar size={{ width: '100%', height: 46 }}>
            <MenuBar.Items>{items}</MenuBar.Items>
            <MenuBar.Message>{{ key: 'msg', display: true, icon: { name: msg?.iconName, color: msg?.iconColor, lable: msg?.msgText } }}</MenuBar.Message>
            <MenuBar.Content fluid scroll>
                <Outlet context={{ msgFn, http, setItems, showOnly }} />
            </MenuBar.Content>
        </MenuBar >
    </React.Fragment>


}
