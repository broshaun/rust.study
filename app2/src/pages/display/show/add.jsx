import React, { useState, useEffect, useReducer, useRef, useCallback, useTransition, Suspense, useMemo } from "react";
import { useOutletContext, useNavigate, useLocation } from 'react-router-dom';
import { InputText, SimpleSelect, AutoHeightTextarea, IconCustomColor, Container } from 'components';
import { InputDate, Address } from 'components/apps';

export function Add() {
  const navigate = useNavigate();
  const location = useLocation()
  const { msgFn, http, setItems, showOnly } = useOutletContext();
  const [data, setData] = useState()
  const [payload, setPayload] = useState({})
  const refState = useRef(new Map())
  const [isPending, startTransition] = useTransition()


  useEffect(() => {
    http.requestParams('GET').then((results) => {
      if (results?.code === 200) {
        startTransition(() => {
          if (data !== results.data) {
            setData(results.data)
            refState.current.set('id', results.data.id)
            refState.current.set('uid', results.data.user_id)
          };
        })
      }
      else {
        msgFn('error');
      }
    })
  }, [http])


  const updShow = useCallback(() => {
    if (refState.current.has('id')) {
      http.requestBodyJson('PATCH', { id: refState.current.get('id'), ...payload })
        .then((results) => {
          if (results.code === 200) {
            msgFn('success', '成功');
          }
          else {
            msgFn('error')
            console.log(results)
          }
        })
    }
  }, [http, payload])

  const initialState = {
    items: [
      { key: 'yes', permission: true, display: true, icon: { name: 'check-circle', color: 'green', lable: '保存' }, onClick: (key) => dispatch({ click: key }) },
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
        refState.current.set('target', '/display/show/');
        break

      case 'no':
        refState.current.set('target', '/display/show/');
        break

      case 'head':
        refState.current.set('target', '/display/show/photo/');
        break
    }
    return { items, count: count + 1 };
  }

  const [state, dispatch] = useReducer(handleMenuClick, initialState)
  useEffect(() => {
    setItems(state.items)
    if (refState.current.has('target')) {
      navigate(refState.current.get('target'), { state: { from: '/display/show/add/', uid: refState.current.get('uid') } })
    }
  }, [state])
  useEffect(() => {
    if (location.pathname === '/display/show/add/') {
      dispatch({ click: 'init' })
      if (location.state?.image_id) {
        setPayload(p => ({ ...p, image_id: location.state?.image_id }))
      }

    }
  }, [location.pathname])


  const SEX_OPTIONS = useMemo(() => [
    { value: '', label: '请选择', disabled: false },
    { value: 'boy', label: '男' },
    { value: 'girl', label: '女' },
  ], [])

  const OPTIONS2 = useMemo(() => [
    { label: '请选择', value: '' },
    { label: '未知', value: 'unknown' },
    { label: '未婚', value: 'unmarried' },
    { label: '已婚', value: 'married' },
    { label: '离婚', value: 'divorced' },
    { label: '丧偶', value: 'widowed' },
  ], [])


  return <Suspense fallback={<div>加载中...</div>}>
    {data && !isPending &&
      <React.Fragment>
        <Container verticalScroll={true} horizontalScroll={true}>
          <br />
          <IconCustomColor name="user-circle" color={payload?.image_id ? 'green' : 'gray'} size={25} onClick={() => dispatch({ click: 'head' })} rightLabel='修改头像' />
          <br />
          <InputText label='姓名:' defaultValue={data.name} placeholder="请输入姓名" onChange={(e) => { setPayload(p => ({ ...p, name: e.target.value })) }} />
          <br />
          <InputDate label='生日:' defaultValue={data.birthday} dateChange={(value) => { setPayload(p => ({ ...p, birthday: value })) }} />
          <br />
          <SimpleSelect label='性别:' defaultValue={data.sex} options={SEX_OPTIONS} onChange={(value) => { setPayload(p => ({ ...p, sex: value })) }} />
          <br />
          <Address label='住址:' defaultValue={data.liveadd} onChange={(value) => { setPayload(p => ({ ...p, liveadd: value })) }} />
          <br />
          <Address label='籍贯:' defaultValue={data.hometown} onChange={(value) => { setPayload(p => ({ ...p, hometown: value })) }} />
          <br />
          <SimpleSelect label='婚姻:' defaultValue={data.marital_status} options={OPTIONS2} onChange={(value) => { setPayload(p => ({ ...p, marital_status: value })) }} />
          <br />
          <InputText label='工作:' defaultValue={data.job} placeholder="要修改的工作名" onChange={(e) => { setPayload(p => ({ ...p, job: e.target.value })) }} />
          <br />
          <AutoHeightTextarea label='自我介绍:' defaultValue={data.description} placeholder="请输入自我介绍 ..." onChange={(value) => { setPayload(p => ({ ...p, description: value })) }} />
          <br />
        </Container>
      </React.Fragment>
    }
  </Suspense>
}
