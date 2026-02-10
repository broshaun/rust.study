import React, { useEffect, useState, useReducer, useRef, useTransition, Suspense } from 'react';
import { SimpleTable, SingleRadio, Divider,Container } from 'components';
import { IconItemHoverScale } from 'components/icon';
import { useOutletContext, useNavigate, useLocation } from 'react-router-dom';
import { useUser } from 'hooks';


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
            current.set('target', '/display/show/');
            break
        case 'check':
            current.set('target', '/display/show/check/');
            break
        case 'update':
            current.set('target', '/display/show/upd/');
            break
        case 'select':
            items = showOnly(items, ['check', 'update'])
            break
    }
    return { items, current };
}

export const List = () => {
    const navigate = useNavigate();
    const location = useLocation();
    const { msgFn, http, setItems } = useOutletContext();
    const { user } = useUser()

    const [isPending, startTransition] = useTransition()
    const [select, setSelect] = useState();
    const [apiData, setApiData] = useState();
    const [payload, setPayload] = useState(p => ({ ...p, size: 10, offset: 1 }));
    const refState = useRef(new Map())
    const [loading, setLoading] = useState();

    useEffect(() => {
        if (loading) return;
        setLoading(true);
        http.requestBodyJson('POST', payload)
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
            { key: 'check', permission: new Set(['admin']).has(user?.role), display: false, icon: { name: 'check', lable: '审核' }, onClick: (key) => dispatch({ click: key }) },
            { key: 'update', permission: new Set(['admin']).has(user?.role), display: false, icon: { name: 'edit', lable: '修改' }, onClick: (key) => dispatch({ click: key }) },
            { key: 'yes', permission: true, display: false, icon: { name: 'check-circle', color: 'green', lable: '确认' }, onClick: (key) => dispatch({ click: key }) },
            { key: 'no', permission: true, display: false, icon: { name: 'times-circle', color: 'red', lable: '取消' }, onClick: (key) => dispatch({ click: key }) },
        ],
        current: new Map()
    }
    const [state, dispatch] = useReducer(handleMenuClick, initialState)
    useEffect(() => {
        setItems(state.items)
        if (state.current.has('target')) {
            navigate(state.current.get('target'), { 'state': { id: select?.id, 'from': location.pathname } })
        }
    }, [state])
    useEffect(() => {
        if (location.pathname === '/display/show/get/') {
            dispatch({ click: 'init' })
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

    const handlePageChange = (page) => {
        setPayload(p => ({ ...p, offset: page }))
    };

    const handleAuditChange = (value) => {
        setPayload((prev) => {
            if (value === null) {
                const { audit_status, ...rest } = prev;
                return rest;
            }
            return { ...prev, audit_status: value };
        });
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

    const OPTIONS = [
        { label: '全部', value: null },
        { label: '未审核', value: 'PENDING' },
        { label: '审核通过', value: 'APPROVED' },
        { label: '审核不通过', value: 'REJECTED' },
        { label: '归档', value: 'ARCHIVED' },
    ];

    const OPTIONS2 = [
        { label: '全部', value: null },
        { label: '未知', value: 'unknown' },
        { label: '未婚', value: 'unmarried' },
        { label: '已婚', value: 'married' },
        { label: '离婚', value: 'divorced' },
        { label: '丧偶', value: 'widowed' },
    ];

    const [isFilter, setIsFilter] = useState(false)


    return <Suspense fallback={<div>加载中...</div>}>
        {apiData &&
            <Container verticalScroll={true} horizontalScroll={true}>

                <IconItemHoverScale
                    name='magnifying-glass'
                    label={isFilter ? '收起筛选' : '展开筛选'}
                    labelPosition="right"
                    onClick={() => {
                        setIsFilter(!isFilter)
                    }}
                />


                {isFilter && <div>
                    <SingleRadio title='审核状态' options={OPTIONS} onSelect={handleAuditChange} />
                    <Divider />
                    <SingleRadio title='婚姻状态' options={OPTIONS2} onSelect={handleMaritalChange} />
                </div>}

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



