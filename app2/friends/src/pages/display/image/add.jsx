import React, { useEffect, useState, useCallback, useReducer, useRef } from "react";
import { useOutletContext, useNavigate, useLocation } from 'react-router-dom';
import { IconCustomColor } from "components/icon";
import { useHttpClient } from 'hooks';


export function Add() {
  const navigate = useNavigate();
  const location = useLocation()
  const { msgFn, http, setItems, showOnly } = useOutletContext();
  const { http: httpFiles } = useHttpClient('/files/img/')
  const [count, setCount] = useState({ total: 0 })
  const refState = useRef(new Map())


  const uploadFile = useCallback((fileInputId) => {
    const fileInput = document.getElementById(fileInputId);
    const file = fileInput?.files[0];
    if (!file) return;
    httpFiles.uploadFiles(file).then((results) => {
      const { code, data, message } = results;
      if (code === 200) {
        http.requestBodyJson('PUT', { file_name: `/imgs/${data}` }).then((results) => {
          console.log(results?.message)
        })
        setCount(prev => ({ ...prev, total: prev.total + 1, [fileInputId]: 'green' }));
      } else {
        console.log(message)
        setCount(prev => ({ ...prev, [fileInputId]: 'red' }));
      }
    });
  }, [httpFiles]);

  const initialState = {
    items: [
      { key: 'back', permission: true, display: true, icon: { name: 'arrow-left-end-on-rectangle', lable: '返回' }, onClick: (key) => dispatch({ click: key }) },
      { key: 'yes', permission: true, display: true, icon: { name: 'check-circle', color: 'green', lable: '确认' }, onClick: (key) => dispatch({ click: key }) },
      { key: 'no', permission: true, display: true, icon: { name: 'times-circle', color: 'red', lable: '取消' }, onClick: (key) => dispatch({ click: key }) },
    ],
    count: 0
  }

  const handleMenuClick = (state, action) => {
    let { items, count } = state
    if (refState.current.has("target")) refState.current.delete('target')
    switch (action?.click) {
      case 'init':
        items = showOnly(items, ['yes', 'no'])
        break
      case 'yes':
        uploadFile('fileInput1');
        uploadFile('fileInput2');
        uploadFile('fileInput3');
        items = showOnly(items, ['back'])
        break
      case 'back':
      case 'no':
        refState.current.set('target', '/display/image/')
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
    if (location.pathname === '/display/image/add/') {
      dispatch({ click: 'init' })
    }
  }, [location.pathname])


  useEffect(() => {
    msgFn('success');
  }, [count])


  return <React.Fragment>


    <div style={{ display: 'inline-flex', alignItems: 'center', gap: '8px', marginBottom: '8px' }}>
      <input type="file" id="fileInput1" accept="image/*" />
      <IconCustomColor name="check-circle" color={count?.fileInput1} size={20} />
    </div>

    <div style={{ display: 'inline-flex', alignItems: 'center', gap: '8px', marginBottom: '8px' }}>
      <input type="file" id="fileInput2" accept="image/*" />
      <IconCustomColor name="check-circle" color={count?.fileInput2} size={20} />
    </div>

    <div style={{ display: 'inline-flex', alignItems: 'center', gap: '8px', marginBottom: '8px' }}>
      <input type="file" id="fileInput3" accept="image/*" />
      <IconCustomColor name="check-circle" color={count?.fileInput3} size={20} />
    </div>

  </React.Fragment>
}
