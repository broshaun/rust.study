import React, { useReducer, useEffect, useState } from 'react'
import { Outlet, useNavigate, useLocation } from "react-router-dom";
import { MenuBar } from 'components'
import { useMsg, useHttpClient, useUser } from 'hooks';



const showOnly = (items, showKeys = []) => items.map(item => ({ ...item, display: item.permission && showKeys.includes(item.key) }))
const handleMenuClick = (state, action) => {
    let { items, current } = state
    // if (action?.from) current.set('from', action.from)
    // if (current.has('method')) current.delete('method')
    if (current.has('target')) current.delete('target')

    switch (action?.click) {
        case 'init':
            items = showOnly(items, ['add', 'list']);
            break
        case 'add':
            current.set('target', '/user/register/add/');
            break
        case 'list':
            current.set('target', '/user/register/get/')
            break
    }
    return { items, current };
}

export default function Register() {
    const navigate = useNavigate();
    const location = useLocation();
    const { http } = useHttpClient('/api/friend/user/register/')
    const { msg, msgFn } = useMsg();
    const { user } = useUser()
    
    const [items, setItems] = useState()

    const initialState = {
        items: [
            { key: 'add', permission: new Set(['admin', 'views']).has(user?.role), display: false, icon: { name: 'user-plus', lable: '新增' }, onClick: (key) => dispatch({ click: key }) },
            { key: 'list', permission: new Set(['admin']).has(user?.role), display: false, icon: { name: 'users', lable: '用户' }, onClick: (key) => dispatch({ click: key }) },
        ],
        current: new Map()
    }
    const [state, dispatch] = useReducer(handleMenuClick, initialState)
    useEffect(() => {
        setItems(state.items)
        if (state.current.has('target')) {
            navigate(state.current.get('target'), { 'state': { 'from': location.pathname } })
        }
    }, [state])
    useEffect(() => {
        if (location.pathname === '/user/register/') {
            dispatch({ click: 'init' })
        }
    }, [location.pathname])



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
