import React, { useEffect, useState, useReducer, useCallback, useRef, useTransition, Suspense } from 'react';
import { useOutletContext, useNavigate, useLocation } from 'react-router-dom';
import { TrueWaterfall } from 'components';


export const List = () => {
    const navigate = useNavigate();
    const location = useLocation()
    const { msgFn, http, setItems, showOnly } = useOutletContext();
    const [apiData, setApiData] = useState();
    const [select, setSelect] = useState();
    const refState = useRef(new Map())
    const [loading, setLoading] = useState();
    const [isPending, startTransition] = useTransition()
    const [count, setCount] = useState(0);

    useEffect(() => {
        if (loading) return;
        setLoading(true)
        http.requestBodyJson('POST')
            .then((results) => {
                if (results?.code === 200) {
                    startTransition(() => {
                        if (results?.data !== apiData) {
                            setApiData(results.data);
                        }
                    })
                }
            })
            .finally(() => setLoading(false))
    }, [http, count])


    const deleteCall = useCallback(() => {
        if (select?.id) {
            http.requestBodyJson("DELETE", { id: select.id })
                .then((results) => {
                    if (results.code === 200) {
                        msgFn('success', `删除`)
                        dispatch({ click: 'init' })
                        setCount(p => p + 1)
                    } else {
                        msgFn('error', results.message)
                    }
                })
        }
    }, [http, select])


    const initialState = {
        items: [
            { key: 'back', permission: true, display: true, icon: { name: 'arrow-left-end-on-rectangle', lable: '返回' }, onClick: (key) => dispatch({ click: key }) },
            { key: 'update', permission: true, display: false, icon: { name: 'edit', lable: '描述' }, onClick: (key) => dispatch({ click: key }) },
            { key: 'delete', permission: true, display: false, icon: { name: 'no-symbol', color: 'red', lable: '删除' }, onClick: (key) => dispatch({ click: key }) },
        ],
        count: 0
    }
    const handleMenuClick = (state, action) => {
        let { items, count } = state
        if (refState.current.has('target')) refState.current.delete('target')
        switch (action?.click) {
            case 'init':
                items = showOnly(items, ['back'])
                break

            case 'back':
                refState.current.set('target', '/display/image/')
                break

            case 'delete':
                deleteCall()
                break

            case 'update':
                refState.current.set('target', '/display/image/upd/')
                break

            case 'select':
                items = showOnly(items, ['back', 'delete', 'update'])
                break
        }
        return { items, count: count + 1 };
    }
    const [state, dispatch] = useReducer(handleMenuClick, initialState)
    useEffect(() => {
        setItems(state.items)
        if (refState.current.has('target')) {
            navigate(refState.current.get('target'), { 'state': select })
        }
    }, [state])
    useEffect(() => {
        if (location.pathname === '/display/image/get/') {
            dispatch({ click: 'init' })
        }
    }, [location.pathname])
    const handleSelect = (row) => {
        setSelect(row)
        dispatch({ click: 'select' })
    };

    return <Suspense fallback={<div>加载中...</div>}>
        {apiData && !isPending &&
            <React.Fragment>
                <TrueWaterfall apiData={apiData} onSelect={handleSelect} />
            </React.Fragment>
        }
    </Suspense>



};
