import React, { useEffect, useState, useRef, useTransition, useReducer, Suspense } from 'react';
import { SimpleTable, SingleRadio, InputText, Divider, Container } from 'components';
import { useOutletContext, useNavigate, useLocation } from 'react-router-dom';
import { useUser } from 'hooks';
import { useRequest } from 'ahooks';


const showOnly = (items, showKeys = []) => items.map(item => ({ ...item, display: item.permission && showKeys.includes(item.key) }));
const handleMenuClick = (state, action) => {
    let { items, current } = state

    if (action?.from) current.set('from', action.from)
    if (current.has('target')) current.delete('target')
    if (current.has('method')) current.delete('method')

    switch (action?.click) {
        case 'init':
            items = showOnly(items, ['back'])
            break
        case 'back':
            if (current.has('from')) current.set('target', current.get('from'));
            break
        case 'update':
            current.set('target', '/user/register/upd/')
            break
        case 'roles':
            current.set('target', '/user/roles/get/')
            break
        case 'stop':
            current.set('target', '/user/register/del/')
            break
        case 'select':
            items = showOnly(items, ['update', 'stop', 'roles'])
            break
    }
    return { items, current };
}


export const List = () => {
    const navigate = useNavigate();
    const location = useLocation();
    const { msgFn, http, setItems } = useOutletContext();
    const [select, setSelect] = useState();
    const [apiData, setApiData] = useState();
    const [payload, setPayload] = useState(p => ({ ...p, size: 10, offset: 1 }));
    const [isPending, startTransition] = useTransition()
    const { user } = useUser()


    const { loading } = useRequest(
        () => {
            http.requestParams('GET', payload).then((results) => {
                if (!results) return;
                const { code, message, data } = results
                if (code === 200) msgFn('success', '账号');
                else console.log(message)
                startTransition(() => {
                    setApiData(data)
                })
            })

        }, { refreshDeps: [payload], }
    )

    console.log('loading',loading)


    const initialState = {
        items: [
            { key: 'back', permission: true, display: true, icon: { name: 'arrow-left-end-on-rectangle', lable: '返回' }, onClick: (key) => dispatch({ click: key }) },
            { key: 'update', permission: new Set(['admin', 'views']).has(user?.role), display: false, icon: { name: 'edit', lable: '密码' }, onClick: (key) => dispatch({ click: key }) },
            { key: 'stop', permission: new Set(['admin', 'views']).has(user?.role), display: false, icon: { name: 'no-symbol', lable: '停用' }, onClick: (key) => dispatch({ click: key }) },
            { key: 'roles', permission: new Set(['admin']).has(user?.role), display: false, icon: { name: 'shield-check', lable: '角色' }, onClick: (key) => dispatch({ click: key }) },
        ],
        current: new Map()
    }


    const [state, dispatch] = useReducer(handleMenuClick, initialState)
    useEffect(() => {
        setItems(state.items)
        if (state.current.has('target')) {
            navigate(state.current.get('target'), { 'state': { from: location.pathname, select, id: select?.id } })
        }
    }, [state])
    useEffect(() => {
        if (location.pathname === '/user/register/get/') {
            dispatch({ click: 'init', from: location.state.from })
        }
    }, [location.pathname, location.state])


    const handleSelect = (row) => {
        if (row === null) {
            setSelect(null);
            dispatch({ click: 'init' })
        } else {
            setSelect(row);
            dispatch({ click: 'select' })
        }
    };

    const handlePageChange = (page) => {
        setPayload(p => ({ ...p, offset: page }))
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
    const phoneTimerRef = useRef();
    const handlePhoneChange = (e) => {
        const value = e.target.value?.trim();
        clearTimeout(phoneTimerRef.current);
        phoneTimerRef.current = setTimeout(() => {
            setPayload(prev => {
                if (!value) {
                    const { phone, ...rest } = prev;
                    return rest;
                }
                return { ...prev, phone: value };
            });
        }, 1000);
    };
    useEffect(() => {
        return () => clearTimeout(phoneTimerRef.current);
    }, []);

    const OPTIONS2 = [
        { label: '全部', value: null },
        { label: '可用', value: 'Usable' },
        { label: '冻结', value: 'Freeze' },
    ];

    return <Suspense fallback={<div>加载中...</div>}>
        {apiData &&
            <Container verticalScroll={true} horizontalScroll={true}>
                <div>{apiData.Detail}</div>
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