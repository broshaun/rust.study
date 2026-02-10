import React, { useEffect, useState, useRef, useTransition, useReducer, useCallback, Suspense } from "react";
import { useOutletContext, useLocation, useNavigate } from 'react-router-dom';
import { SimpleSelect } from 'components';


export function Update() {
  const { setItems, msgFn, http, showOnly } = useOutletContext();
  const location = useLocation();
  const navigate = useNavigate();
  const [isPending, startTransition] = useTransition()
  const [payload, setPayload] = useState()
  const refState = useRef(new Map())
  const [apiData, setApiData] = useState({});



  const updRoles = useCallback(() => {
    if (refState.current.has('id')) {
      http.requestBodyJson('PATCH', { id: refState.current.get('id'), ...payload })
        .then((results) => {
          console.log('lresults', results)
          if (results.code === 200) msgFn('success', "修改成功");
          else msgFn('error', results.message);
        })
    } else if (refState.current.has('user_id')) {
      http.requestBodyJson('PUT', { user_id: refState.current.get('user_id'), ...payload })
        .then((results) => {
          if (results.code === 200) msgFn('success', "修改成功");
          else msgFn('error', results.message);
        })
    }
  }, [payload])


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
        updRoles()
        refState.current.set('target', '/user/roles/get/');
        break
      case 'no':
        refState.current.set('target', '/user/roles/get/');
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
    if (location.pathname === '/user/roles/upd/') {
      dispatch({ click: 'init' })

      if (location.state?.id) {
        refState.current.set('id', location.state.id)
      } else if (location.state?.user_id) {
        refState.current.set('user_id', location.state.user_id)
      }

      if (refState.current.has('id')) {
        http.requestParams('GET', { id: refState.current.get('id') })
          .then((results) => {
            if (results?.code === 200) {
              msgFn('success');
              startTransition(() => {
                if (apiData !== results.data) {
                  setApiData(results.data)
                };
              })
            } else {
              msgFn('error');
              console.log(results)
            }
          })
      }

    }
  }, [location.pathname, http])


  const options1 = [
    { value: '', label: '请选择', disabled: false },
    { value: 'admin', label: '管理员' },
    { value: 'views', label: '查看者' },
    { value: 'shows', label: '仅发布' },
  ]

  const options2 = [
    { value: '', label: '请选择', disabled: false },
    { value: 'Usable', label: '可用' },
    { value: 'Freeze', label: '冻结' },
  ]

  return <Suspense fallback={<div>加载中...</div>}>
    {apiData && !isPending &&
      <React.Fragment>
        <br />
        <br />
        <SimpleSelect label='角色:' options={options1} defaultValue={apiData.roles_code} onChange={(value, label) => { setPayload(p => ({ ...p, roles_code: value })) }} />
        <br />
        <br />
        <SimpleSelect label='状态:' options={options2} defaultValue={apiData.state} onChange={(value, label) => { setPayload(p => ({ ...p, roles_state: value })) }} />
      </React.Fragment>
    }
  </Suspense>
}
