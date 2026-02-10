import React, { useEffect, useState, useReducer, useTransition, useRef, Suspense } from 'react';
import { useOutletContext, useLocation, useNavigate } from 'react-router-dom';
import { TrueWaterfall } from 'components';
import { useHttpClient } from 'hooks';


export const Photo = () => {
    const location = useLocation();
    const navigate = useNavigate();

    const { msgFn, setItems, showOnly } = useOutletContext();
    const { http: httpImage } = useHttpClient('/api/friend/user/images/')
    const [apiData, setApiData] = useState();
    const refState = useRef(new Map())
    const [loading, setLoading] = useState();
    const [isPending, startTransition] = useTransition()

    useEffect(() => {
        if (loading) return;
        setLoading(true)
        if (!location.state?.uid) return;
        httpImage.requestBodyJson('POST', { "uid": location.state.uid })
            .then((results) => {
                if (results?.code === 200) {
                    msgFn('success');
                    startTransition(() => {
                        if (results?.data !== apiData) setApiData(results?.data)
                    })
                }
            })
            .finally(() => setLoading(false))


    }, [httpImage])

    const initialState = {
        items: [
            { key: 'back', permission: true, display: true, icon: { name: 'arrow-left-end-on-rectangle', lable: '返回' }, onClick: (key) => dispatch({ click: key }) },
        ],
        count: 0
    }
    const handleMenuClick = (state, action) => {
        let { items, count } = state
        if (refState.current.has('target')) refState.current.delete('target');
        switch (action?.click) {
            case 'init':
                items = showOnly(items, ['back'])
                break

            case 'back':
                if (refState.current.has('from')) refState.current.set('target', refState.current.get('from'));
                else refState.current.set('target', '/display/show/');
                break

            case 'select':
                if (refState.current.get('from') === '/display/show/add/') {
                    refState.current.set('target', '/display/show/add/')
                }
                break
        }
        return { items, count: count + 1 };
    }
    const [state, dispatch] = useReducer(handleMenuClick, initialState)
    useEffect(() => {
        setItems(state.items)
        if (refState.current.has('target')) {
            navigate(refState.current.get('target'), { 'state': { image_id: refState.current.get('select')?.id } })
        }
    }, [state])
    useEffect(() => {
        if (location.pathname === '/display/show/photo/') {
            if (location.state?.uid) refState.current.set('uid', location.state.uid);
            if (location.state?.from) refState.current.set('from', location.state.from);
            dispatch({ click: 'init' })

        }
    }, [location.pathname])




    return <React.Fragment>
        {apiData && !isPending &&
            <React.Fragment>
                <TrueWaterfall apiData={apiData} onSelect={(value) => { refState.current.set('select', value); dispatch({ click: 'select' }); }} />
            </React.Fragment>
        }
    </React.Fragment>
};


