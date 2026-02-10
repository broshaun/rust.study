import React, { useEffect, useReducer, useState } from 'react'
import { Outlet, useNavigate, useLocation } from "react-router-dom";
import { MenuBar } from 'components'
import { useMsg, useUser } from 'hooks';
import { useHttpClient } from 'hooks';

const showOnly = (items, showKeys = []) => items.map(item => ({ ...item, display: item.permission && showKeys.includes(item.key) }));
const handleMenuClick = (state, action) => {
    let { items, current } = state
    if (action?.from) current.set('from', action.from)
    if (current.has('target')) current.delete('target')
    if (current.has('method')) current.delete('method')

    switch (action?.click) {
        case 'init':
            items = showOnly(items, ['list'])
            break
        case 'list':
            current.set('target', '/user/roles/get/')
            break
    }
    return { items, current };
}

export default function Roles() {
    const { http } = useHttpClient('/api/friend/user/roles/')
    const navigate = useNavigate();
    const location = useLocation();
    const { msg, msgFn } = useMsg();
    const [items, setItems] = useState()
    const { user } = useUser()

    const initialState = {
        items: [
            { key: 'list', permission: true, display: false, icon: { name: 'user-group', lable: '角色' }, onClick: (key) => dispatch({ click: key }) },
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
        if (location.pathname === '/user/roles/') {
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
