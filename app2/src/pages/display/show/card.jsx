import React, { useEffect, useState, useReducer, useRef, Suspense, useTransition } from 'react';
import { useOutletContext, useNavigate, useLocation } from 'react-router-dom';
import { SingleRadio, Divider, InputText,Container } from 'components';
import { CardList } from 'components/apps';


export const CardShow = () => {
    const navigate = useNavigate();
    const location = useLocation()
    const { msgFn, http, setItems, showOnly } = useOutletContext();
    const [apiData, setApiData] = useState();
    const [payload, setPayload] = useState(p => ({ ...p, size: 2, offset: 1, audit_status: 'APPROVED' }));
    const [select, setSelect] = useState();
    const refState = useRef(new Map())
    const [isPending, startTransition] = useTransition()
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        if (loading) return;
        setLoading(true)
        http.requestBodyJson('POST', payload)
            .then((results) => {
                if (results?.code === 200) {
                    msgFn('success');
                    startTransition(() => {
                        if (results?.data !== apiData) setApiData(results?.data)
                    })
                }
            })
            .finally(() => setLoading(false))
    }, [http, payload]);


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
                refState.current.set('target', '/display/show/');
                break
            case 'select':
                refState.current.set('target', '/display/show/photo/')
                break
        }
        return { items, count: count + 1 };
    }
    const [state, dispatch] = useReducer(handleMenuClick, initialState)
    useEffect(() => {
        setItems(state.items)
        if (refState.current.has('target')) {
            navigate(refState.current.get('target'), { state: { 'from': '/display/show/card/', 'uid': select?.user_id } })
        }
    }, [state])

    useEffect(() => {
        if (location.pathname === '/display/show/card/') {
            dispatch({ click: 'init' })
        }
    }, [location.pathname])



    const handlePageChange = (page) => {
        setPayload(p => ({ ...p, offset: page }))
    };

    const handleMaritalChange = (value) => {
        setPayload((prev) => {
            if (value === null) {
                const { marital_status, ...rest } = prev;
                return rest;
            }
            return { ...prev, marital_status: value };
        });
    };


    const handleSexChange = (value) => {
        setPayload((prev) => {
            if (value === null) {
                const { sex, ...rest } = prev;
                return rest;
            }
            return { ...prev, sex: value };
        });
    };

    const handleNameChange = (e) => {
        const value = e.target.value?.trim();
        startTransition(() => {
            setPayload(prev => {
                if (!value) {
                    const { name, ...rest } = prev;
                    return rest;
                }
                return { ...prev, name: value };
            })
        })
    }

    const OPTIONS2 = [
        { label: '全部', value: null },
        { label: '未知', value: 'unknown' },
        { label: '未婚', value: 'unmarried' },
        { label: '已婚', value: 'married' },
        { label: '离婚', value: 'divorced' },
        { label: '丧偶', value: 'widowed' },
    ];
    const OPTIONS3 = [
        { label: '全部', value: null },
        { label: '女', value: 'girl' },
        { label: '男', value: 'boy' },
    ];

    return <Suspense fallback={<div>加载中...</div>}>
        {apiData &&
            <Container verticalScroll={true} horizontalScroll={true}>
                <SingleRadio title='性别' options={OPTIONS3} onSelect={handleSexChange} />
                <Divider />
                <InputText placeholder='搜索姓名...' label='姓名' onChange={handleNameChange} />
                <Divider />
                <SingleRadio title='婚姻状态' options={OPTIONS2} onSelect={handleMaritalChange} />
                <Divider />
                <CardList pageSize={2} datas={apiData} onPageChange={handlePageChange} onSelect={(value) => { setSelect(value); dispatch({ click: 'select' }); }} />
            </Container>
        }
    </Suspense>
};