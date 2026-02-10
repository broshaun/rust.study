import React, { useReducer, useEffect, useState, useRef } from 'react'
import { Outlet, useNavigate, useLocation } from "react-router-dom";
import { MenuBar } from 'components'
import { useMsg, useHttpClient, useUser, useWinWidth } from 'hooks';


const showOnly = (items, showKeys = []) => items.map(item => ({ ...item, display: item.permission && showKeys.includes(item.key) }));
const handleMenuClick = (state, action) => {
    let { items, current } = state
    if (current.has('target')) current.delete('target')
    switch (action?.click) {
        case 'init':
            items = showOnly(items, ['list', 'card', 'add'])
            break
        case 'list':
            current.set('target', '/display/show/get/')
            break
        case 'card':
            current.set('target', '/display/show/card/')
            break
        case 'add':
            current.set('target', '/display/show/add/')
            break
    }
    return { items, current };
}

export default function Show() {
    const location = useLocation();
    const navigate = useNavigate();
    const { http } = useHttpClient('/api/friend/user/show/')
    const { msg, msgFn } = useMsg();
    const { user } = useUser()
    const [items, setItems] = useState()
    // const refState = useRef(new Map())

    const initialState = {
        items: [
            { key: 'list', permission: new Set(['admin']).has(user?.role), display: false, icon: { name: 'clipboard-document-check', lable: '列表' }, onClick: (key) => dispatch({ click: key }) },
            { key: 'card', permission: new Set(['admin', 'views']).has(user?.role), display: false, icon: { name: 'wallet', lable: '展示' }, onClick: (key) => dispatch({ click: key }) },
            { key: 'add', permission: new Set(['admin', 'views', 'shows']).has(user?.role), display: false, icon: { name: 'identification', lable: '名片' }, onClick: (key) => dispatch({ click: key }) },
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
        if (location.pathname === '/display/show/') {
            dispatch({ click: 'init' })
        }
    }, [location.pathname])

    // const { winSize } = useWinWidth()
    // const [height, setHeight] = useState(46)
    // useEffect(() => {
    //     console.log('winSize', winSize)
    //     if (winSize < 640 && winSize >= 500) setHeight(40)
    //     else if (winSize < 500 && winSize >= 375) setHeight(35)
    //     else if (winSize < 375) setHeight(25)
    //     else setHeight(46)
    // }, [winSize])


    return <React.Fragment>
        <MenuBar size={{ width: '100%', height: 46 }}>
            <MenuBar.Items>{items}</MenuBar.Items>
            <MenuBar.Message>{{ key: 'msg', display: true, icon: { name: msg?.iconName, color: msg?.iconColor, lable: msg?.msgText } }}</MenuBar.Message>
            <MenuBar.Content>
                <Outlet context={{ msgFn, http, setItems, showOnly }} />
            </MenuBar.Content>
        </MenuBar >
    </React.Fragment>

}






