import React, { useEffect, useState, useReducer, useRef } from "react";
import { useOutletContext, useLocation, useNavigate } from 'react-router-dom';
import { InputText } from 'components';



export function Update() {
  const { msgFn, http, setItems, showOnly } = useOutletContext();
  const location = useLocation();
  const navigate = useNavigate();
  const [user, setUser] = useState()
  const refState = useRef(new Map())

  const upduser = () => {
    if (refState.current.has('id')) {
      if (user) {
        http.requestBodyJson('PATCH', { id: refState.current.get('id'), ...user }).then(
          (results) => {
            if (results.code === 200) {
              msgFn('success', "修改成功")
            } else {
              msgFn('error', results.message)
            }
          })
      } else {
        msgFn('warning', '无修改')
      }
    }
  }


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
        upduser()
        refState.current.set('target', '/user/register/');
        break

      case 'no':
        refState.current.set('target', '/user/register/');
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
    if (location.pathname === '/user/register/upd/') {
      dispatch({ click: 'init' })

      if (location.state?.id) {
        refState.current.set('id', location.state.id)
      }
    }
  }, [location.pathname])


  const options1 = [
    { value: '', label: '请选择', disabled: false },
    { value: 'admin', label: '管理员' },
    { value: 'views', label: '查看者' },
  ]

  const options2 = [
    { value: '', label: '请选择', disabled: false },
    { value: 'Usable', label: '可用' },
    { value: 'Freeze', label: '冻结' },
  ]

  return <React.Fragment>
    <br />
    {/* <InputText
      label='手机:'
      placeholder="输入要修改的手机号"
      defaultValue={location.state?.select.phone}
      onChange={(e) => { setUser({ ...user, phone: e.target.value }); }}
    />
    <br />
    <br /> */}
    <InputText
      label='密码:'
      placeholder="输入要修改的密码"
      defaultValue={location.state?.select.pass_word}
      onChange={(e) => { setUser({ ...user, pass_word: e.target.value }); }}
    />
    <br />
    <br />

  </React.Fragment>
}
