import React, { useCallback, useEffect, useState, useRef, useReducer, startTransition, Suspense } from 'react';
import { useOutletContext, useNavigate, useLocation } from 'react-router-dom';
import { SimpleTable, Divider, SingleRadio, InputText ,Container} from 'components';
import { useMsg, useHttpClient, useUser, useWinWidth } from 'hooks';


export const Get = () => {
    const navigate = useNavigate();
    const location = useLocation();
    const { msgFn, http, setItems, showOnly } = useOutletContext();
    const [select, setSelect] = useState();
    const [apiData, setApiData] = useState();
    const [payload, setPayload] = useState({})
    const refState = useRef(new Map())
    const [loading, setLoading] = useState();
    const { user } = useUser()

    const initRoles = useCallback(() => {
        if (loading) return;
        setLoading(true);
        http.requestBodyJson('POST', { ...payload, user_id: refState.current.get('user_id') })
            .then((results) => {

                if (results?.code === 200) {
                    msgFn('success');
                    startTransition(() => {
                        if (results?.data !== apiData) setApiData(results?.data);
                    })
                }
            })
            .finally(() => setLoading(false))
    }, [http, payload]);

    const initialState = {
        items: [
            { key: 'back', permission: new Set(['admin', 'views']).has(user?.role), display: true, icon: { name: 'arrow-left-end-on-rectangle', lable: '返回' }, onClick: (key) => dispatch({ click: key }) },
            { key: 'update', permission: new Set(['admin']).has(user?.role), display: false, icon: { name: 'edit', lable: '授权' }, onClick: (key) => dispatch({ click: key }) },
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
                console.log('back', refState.current.get('from'))

                if (refState.current.has('from')) refState.current.set('target', refState.current.get('from'));
                else refState.current.set('target', '/user/roles/');
                break
            case 'update':
                refState.current.set('target', '/user/roles/upd/');
                break
            case 'select':
                items = showOnly(items, ['back', 'update'])
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
        if (location.pathname === '/user/roles/get/') {
            dispatch({ click: 'init' })

            if (location.state) {
                const { select, from } = location.state
                if (from) {
                    refState.current.set('from', from)
                    if (from === '/user/register/get/') {
                        if (select?.id) refState.current.set('user_id', select.id)
                    }
                }
            }
            initRoles()
        }
    }, [location.pathname])


    const handleSelect = (row) => {
        if (!row) {
            setSelect(null);
            dispatch({ click: 'init' })
        } else {
            setSelect(row);
            dispatch({ click: 'select' })
        }
    };


    const handleRoleChange = (value) => {
        setPayload((prev) => {
            if (value === null) {
                const { roles_state, ...rest } = prev;
                return rest;
            }
            return { ...prev, roles_state: value };
        });
    };


    const handlePhoneChange = (e) => {
        const value = e.target.value?.trim();
        startTransition(() => {
            setPayload(prev => {
                if (!value) {
                    const { phone, ...rest } = prev;
                    return rest;
                }
                return { ...prev, phone: value };
            });
        })
    };

    const handlePageChange = (page) => {
        setPayload(p => ({ ...p, offset: page }))
    };
    const OPTIONS2 = [
        { label: '全部', value: null },
        { label: '可用', value: 'Usable' },
        { label: '冻结', value: 'Freeze' },
    ];

    return <Suspense fallback={<div>加载中...</div>}>
        {apiData &&
            <Container verticalScroll={true} horizontalScroll={true}>
                <SingleRadio title='角色状态' options={OPTIONS2} onSelect={handleRoleChange} />
                <Divider />
                <InputText label='电话：' onChange={handlePhoneChange} />
                <Divider />
                <SimpleTable>
                    <SimpleTable.Page total={apiData?.total} size={payload?.size} currentPage={payload?.offset} onPageChange={handlePageChange} />
                    <SimpleTable.Heads data={apiData?.heads} />
                    <SimpleTable.Detail data={apiData?.detail} onTableRowSelect={handleSelect} />
                </SimpleTable>
            </Container>
        }
    </Suspense>
};
