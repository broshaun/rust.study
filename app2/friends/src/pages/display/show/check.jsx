import React, { useEffect, useState, useReducer, useCallback, useRef, Suspense, useTransition } from "react";
import { useOutletContext, useLocation, useNavigate } from 'react-router-dom';
import { SingleRadio } from 'components';


const showOnly = (items, showKeys = []) => items.map(item => ({ ...item, display: item.permission && showKeys.includes(item.key) }));
const handleMenuClick = (state, action) => {

  let { items, current } = state
  if (action?.from) current.set('from', action.from)
  if (current.has('target')) current.delete('target')
  if (current.has('method')) current.delete('method')

  switch (action?.click) {
    case 'init':
      current.set('id', action?.id)
      items = showOnly(items, ['yes', 'no'])
      break
    case 'yes':
      current.set('method', true)
    case 'no':
      if (current.has('from')) current.set('target', current.get('from'));;
      break
  }
  return { items, current };
}

export function Check() {
  const location = useLocation();
  const navigate = useNavigate();

  const { setItems, msgFn, http } = useOutletContext();
  const [payload, setPayload] = useState()
  const [data, setData] = useState()
  const [isPending, startTransition] = useTransition();
  const [loading, setLoading] = useState(false);

  // console.log('location.state', location.state)
  useEffect(() => {
    console.log('location.state', location.state)
    if (loading) return;
    setLoading(true)
    if (!location.state?.id) return;
    http.requestParams('GET', { id: location.state?.id })
      .then((results) => {
        if (results?.code === 200) {
          msgFn('success');
          startTransition(() => {
            if (data !== results.data) {
              setData(results.data)
            };
          })
        }
        else {
          msgFn('error');
          console.log(results)
        }
      })
      .finally(() => setLoading(false))
  }, [http])


  const updCheck = useCallback((id) => {
    if (id) {
      http.requestBodyJson('PATCH', { id, ...payload })
        .then(
          (results) => {
            if (results.code === 200) {
              msgFn('success', "修改成功")
            } else {
              msgFn('error')
              console.log(results)
            }
          })
    }

  }, [payload])

  const initialState = {
    items: [
      { key: 'yes', permission: true, display: false, icon: { name: 'check-circle', color: 'green', lable: '确认' }, onClick: (key) => dispatch({ click: key }) },
      { key: 'no', permission: true, display: false, icon: { name: 'times-circle', color: 'red', lable: '取消' }, onClick: (key) => dispatch({ click: key }) },
    ],
    current: new Map()
  }


  const [state, dispatch] = useReducer(handleMenuClick, initialState)
  useEffect(() => {
    setItems(state.items)
    if (state.current.has('target')) {
      navigate(state.current.get('target'), { 'state': { from: location.pathname } })
    }
    if (state.current.has('method')) {
      updCheck(state.current.get('id'))
    }
  }, [state])
  useEffect(() => {
    if (location.pathname === '/display/show/check/') {
      dispatch({ click: 'init', id: location.state?.id, from: location.state?.from })
    }
  }, [location.pathname, location.state])




  const OPTIONS = [
    { label: '未审核', value: 'PENDING' },
    { label: '审核通过', value: 'APPROVED' },
    { label: '审核不通过', value: 'REJECTED' },
    { label: '归档', value: 'ARCHIVED' },
  ];
  return <Suspense fallback={<div>加载中...</div>}>
    {data && !isPending &&
      <React.Fragment>
        <br />
        <SingleRadio title='审核状态' vertical='vertical' options={OPTIONS} defaultValue={data.audit_status} onSelect={(value) => { setPayload(p => ({ ...p, audit_status: value })) }} />
        <br />
        <br />
      </React.Fragment>
    }
  </Suspense>
}
