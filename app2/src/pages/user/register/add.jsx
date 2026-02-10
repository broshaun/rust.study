import React, { useState, useEffect, useCallback, useReducer } from "react";
import { useOutletContext, useLocation, useNavigate } from 'react-router-dom';
import { InputText } from 'components';
import { useRequest } from 'ahooks';

const showOnly = (items, showKeys = []) => items.map(item => ({ ...item, display: showKeys.includes(item.key) }))
const handleMenuClick = (state, action) => {
  let { items, current } = state
  if (action?.from) current.set('from', action.from)
  if (current.has('target')) current.delete('target')
  if (current.has('method')) current.delete('method')

  switch (action?.click) {
    case 'init':
      items = showOnly(items, ['yes', 'no'])
      break
    case 'yes':
      current.set('method', true)
    case 'no':
    case 'back':
      if (current.has('from')) current.set('target', current.get('from'));
      break
  }
  return { items, current };
}

export function Add() {
  const { msgFn, http, setItems } = useOutletContext();
  const [payload, setPayload] = useState({})
  const location = useLocation()
  const navigate = useNavigate();

  const { runAsync: runAdd } = useRequest(() => {
    if (!payload?.phone) {
      msgFn('error', "请输入手机")
    }
    else if (!payload?.pass_word) {
      msgFn('error', "请输入密码")
    }
    http.requestBodyJson('PUT', { 'phone': payload.phone, 'pass_word': payload.pass_word })
      .then((results) => {
        if (!results) return;
        const { code, message, data } = results
        if (code === 200) msgFn('success', '注册成功');
        else msgFn('error', message);
      })
    return 'ok'
  }, { manual: true })

  const initialState = {
    items: [
      { key: 'yes', permission: true, display: true, icon: { name: 'check-circle', color: 'green', lable: '确认' }, onClick: (key) => dispatch({ click: key }) },
      { key: 'no', permission: true, display: true, icon: { name: 'times-circle', color: 'red', lable: '取消' }, onClick: (key) => dispatch({ click: key }) },
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
      runAdd()
    }
  }, [state])
  useEffect(() => {
    if (location.pathname === '/user/register/add/') {
      dispatch({ click: 'init', from: location.state?.from })
    }
  }, [location.pathname, location.state])

  const [isPhone, setIsPhone] = useState(true)
  return <React.Fragment>
    <InputText
      error={!isPhone}
      type='text'
      maxLength={11}
      label='手机:'
      placeholder="请输入手机"
      onChangeValue={(value) => { setIsPhone(Number.isFinite(Number(value))); setPayload(p => ({ ...p, phone: value })) }}
    />
    <br />
    <InputText
      label='密码:'
      type="password"
      placeholder="请输入密码"
      onChange={(e) => { setPayload(p => ({ ...p, pass_word: e.target.value })) }}
    />
    <br />
    <br />
  </React.Fragment>
}
