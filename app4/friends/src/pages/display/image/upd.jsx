import React, { useEffect, useState, useReducer, useRef, useCallback } from "react";
import { useOutletContext, useLocation, useNavigate } from 'react-router-dom';
import { AutoHeightTextarea } from 'components';
// 设置头像


export function Update() {
  const location = useLocation();
  const navigate = useNavigate();
  const { setItems, msgFn, http, showOnly } = useOutletContext();
  const [payload, setPayload] = useState()
  const refState = useRef(new Map())
  const [loading, setLoading] = useState();
  const [apiData, setApiData] = useState()

  useEffect(() => {
    if (loading) return;
    setLoading(true);
    if (location.state?.id) return;
    http.requestParams('GET', { id: location.state.id })
      .then((results) => {
        if (results?.code === 200) {
          if (apiData !== results?.data) setApiData(results?.data)
        }
      })
      .finally(() => setLoading(false))
  }, [])


  const updCall = useCallback(() => {
    http.requestBodyJson('PATCH', { id: refState.current.get('id'), ...payload })
      .then((results) => {
        if (results.code === 200) {
          msgFn('success', "修改成功")
        } else {
          msgFn('error', results.message)
        }
      })
  }, [http, payload]
  )

  const initialState = {
    items: [
      { key: 'back', permission: true, display: true, icon: { name: 'arrow-left-end-on-rectangle', lable: '返回' }, onClick: (key) => dispatch({ click: key }) },
      { key: 'yes', permission: true, display: false, icon: { name: 'check-circle', color: 'green', lable: '确认' }, onClick: (key) => dispatch({ click: key }) },
    ],
    count: 0
  }
  const handleMenuClick = (state, action) => {
    let { items, count } = state
    if (refState.current.has('target')) refState.current.delete('target')
    switch (action?.click) {
      case 'init':
        items = showOnly(items, ['back'])
        break

      case 'back':
        refState.current.set('target', '/display/image/get/')
        break

      case 'update':
        items = showOnly(items, ['back', 'yes'])
        break

      case 'yes':
        updCall()
        refState.current.set('target', '/display/image/get/')
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
    if (location.pathname === '/display/image/upd/') {
      dispatch({ click: 'init' })
      if (location.state?.id) {
        refState.current.set('id', location.state.id)
      }
    }
  }, [location.pathname])



  return <React.Fragment>
    <br />
    <AutoHeightTextarea label='图片描述:' defaultValue={location.state?.describe} placeholder="修改图片描述 ..." onChange={(value) => { setPayload(p=>({ ...p, describe: value })); dispatch({ click: "update" }) }} />
    <br />
    <br />


  </React.Fragment>
}
