import React, { useReducer, useEffect, useState } from 'react'
import { Outlet, useNavigate, useLocation } from "react-router-dom";
import { MenuBar } from 'components'
import { useMsg, useHttpClient, useUser, useWinWidth } from 'hooks';


const showOnly = (items, showKeys = []) => items.map(item => ({ ...item, display: item.permission && showKeys.includes(item.key) }));
const handleMenuClick = (state, action) => {
    let { items, current } = state
    if (current.has('target')) current.delete('target')
    switch (action?.click) {
        case 'init':
            items = showOnly(items, ['add', 'list']);
            break

        case 'add':
            current.set('target', '/display/image/add/')
            break

        case 'list':
            current.set('target', '/display/image/get/')
            break
    }
    return { items, current };
}
export default function Image() {
    const navigate = useNavigate();
    const location = useLocation();
    const { http } = useHttpClient('/api/friend/user/images/')
    const { msg, msgFn } = useMsg();
    const { user } = useUser()
    const [items, setItems] = useState()

    const initialState = {
        items: [
            { key: 'add', permission: new Set(['admin', 'views', 'shows']).has(user?.role), display: false, icon: { name: 'identification', lable: '上传' }, onClick: (key) => dispatch({ click: key }) },
            { key: 'list', permission: new Set(['admin', 'views', 'shows']).has(user?.role), display: false, icon: { name: 'clipboard-document-check', lable: '相册' }, onClick: (key) => dispatch({ click: key }) },
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
        if (location.pathname === '/display/image/') {
            dispatch({ click: 'init' })
        }
    }, [location.pathname])

    const { winSize } = useWinWidth()
    const [height, setHeight] = useState(46)
    useEffect(() => {
        if (winSize < 640 && winSize >= 500) setHeight(40)
        else if (winSize < 500 && winSize >= 375) setHeight(35)
        else if (winSize < 375) setHeight(25)
        else setHeight(46)
    }, [winSize])

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




