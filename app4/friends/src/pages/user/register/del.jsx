import React, { useEffect, useRef, useReducer } from "react";
import { useOutletContext, useLocation, useNavigate } from 'react-router-dom';
import { Message } from "components";


export function Del() {
    const { msgFn, http, setItems, showOnly } = useOutletContext();
    const navigate = useNavigate();
    const location = useLocation()
    const refState = useRef(new Map())

    const deluser = () => {
        if (refState.current.has('id')) {
            http.requestBodyJson("DELETE", { id: refState.current.get('id') }).then(
                (results) => {
                    if (results.code === 200) {
                        msgFn('success', `【${refState.current.get('phone')}】已停用`)
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
                deluser()
                refState.current.set('target', '/user/register/');
                break

            case 'no':
                refState.current.set('target', '/user/register/');
                break

        }
        return { items, count: count + 1 };
    }
    const [state, dispatch] = useReducer(handleMenuClick, initialState)
    useEffect(() => {
        setItems(state.items)
        if (refState.current.has('target')) {
            navigate(refState.current.get('target'))
        }
    }, [state])

    useEffect(() => {
        if (location.pathname === '/user/register/del/') {
            dispatch({ click: 'init' })
            if (location.state?.select) {
                refState.current.set('id', location.state.select.id)
                refState.current.set('phone', location.state.select?.phone)
            }

        }
    }, [location.pathname])



    return <Message title='停用账号' content={<p>要停用的账号是：{refState.current.get('phone')}</p>} />

}
