import React, { useEffect, useState, useReducer, useRef, useCallback, useTransition, Suspense } from "react";
import { useOutletContext, useLocation, useNavigate, } from 'react-router-dom';
import { InputText, SimpleSelect } from 'components';



export function Update() {
  const location = useLocation();
  const navigate = useNavigate();

  const { setItems, msgFn, http, showOnly } = useOutletContext();
  const [payload, setPayload] = useState()
  const refState = useRef(new Map())
  const [isPending, startTransition] = useTransition()
  const [apiData, setApiData] = useState();


  useEffect(() => {
    if (!location.state?.id) return
    http.requestParams('GET', { id: location.state.id }).then((results) => {
      if (results?.code === 200) {
        msgFn('success');
        startTransition(() => {
          if (apiData !== results.data) {
            setApiData(results.data)
          };
        })
      }
      else {
        msgFn('error');
        console.log(results)
      }
    })
  }, [http])


  const updShow = useCallback(() => {

    http.requestBodyJson('PATCH', { id: refState.current.get('id'), ...payload })
      .then((results) => {
        console.log('results++++++',results)
        if (results.code === 200) msgFn('success', "修改成功");
        else msgFn('error', results.message);
      })
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
        updShow()
        refState.current.set('target', '/display/show/get/');
        break
      case 'no':
        refState.current.set('target', '/display/show/get/');
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
    if (location.pathname === '/display/show/upd/') {
      dispatch({ click: 'init' })
      if (location.state?.id) {
        refState.current.set('id', location.state.id)
      }
    }
  }, [location.pathname])


  const options1 = [
    { value: '', label: '请选择', disabled: false },
    { value: 'unknown', label: '未知' },
    { value: 'unmarried', label: '未婚' },
    { value: 'married', label: '已婚' },
    { value: 'divorced', label: '离婚' },
    { value: 'widowed', label: '丧偶' },
  ]

  const options2 = [
    { value: '', label: '请选择', disabled: false },
    { value: 'boy', label: '男' },
    { value: 'girl', label: '女' },
  ]


  return <Suspense fallback={<div>加载中...</div>}>
    {apiData && !isPending &&
      <React.Fragment>
        <br />
        <InputText label='姓名:' placeholder="输入要修改的姓名" defaultValue={apiData.name} onChange={(e) => setPayload(p => ({ ...p, name: e.target.value }))} />
        <br />
        <br />
        <SimpleSelect label='性别:' options={options2} defaultValue={apiData.sex} onChange={(value, label) => { setPayload(p => ({ ...p, sex: value })) }} />
        <br />
        <br />
        <SimpleSelect label='婚姻:' options={options1} defaultValue={apiData.marital_status} onChange={(value, label) => { setPayload(p => ({ ...p, marital_status: value })) }} />
        <br />
        <br />
        <InputText label='工作:' placeholder="输入要修改的工作名称" defaultValue={apiData.job} onChange={(e) => { setPayload(p => ({ ...p, job: e.target.value })) }} />
        <br />
        <br />
      </React.Fragment>
    }
  </Suspense>
}
