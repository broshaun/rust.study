import React, { useEffect, useState, useReducer, useRef } from 'react';
import { useOutletContext, useNavigate, useLocation } from 'react-router-dom';
import { useLogin, useUser } from 'hooks';


export const Logout = () => {
  const { msgFn, http, setItems, showOnly } = useOutletContext();
  const navigate = useNavigate();
  const location = useLocation()
  const { fnLogout } = useLogin();
  const { delUser } = useUser();
  const refState = useRef(new Map())


  // 操作按钮YES触发执行：
  const logout = () => {
    http.requestParams('DELETE')
      .then((results) => {
        if (results.code === 200) {
          msgFn('success', "已登出")
        } else {
          msgFn('error', results.message)
        }
      })
    fnLogout()
    delUser()
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
        logout()
      case 'no':
        refState.current.set('target', refState.current.get('from'))
        break
    }
    return { items, count: count + 1 };
  }

  const [state, dispatch] = useReducer(handleMenuClick, initialState)
  useEffect(() => {
    setItems(state.items)
    if (refState.current.has('target')) {
      navigate(refState.current.get('target'), { state: { from: location.pathname } })
    }
  }, [state])
  useEffect(() => {
    if (location.state?.from) refState.current.set('from', location.state.from);
    if (location.pathname === '/user/login/logout/') {
      dispatch({ click: 'init' })
    }
  }, [location.pathname])





  // 格式化当前时间
  const formatCurrentTime = () => {
    const date = new Date();
    const weekdays = ['日', '一', '二', '三', '四', '五', '六'];
    return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')} ${String(date.getHours()).padStart(2, '0')}:${String(date.getMinutes()).padStart(2, '0')}:${String(date.getSeconds()).padStart(2, '0')} 星期${weekdays[date.getDay()]}`;
  };

  const [currentTime, setCurrentTime] = useState(formatCurrentTime());
  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(formatCurrentTime());
    }, 1000);
    return () => clearInterval(timer);
  }, []);


  return <React.Fragment>
    当前时间：{currentTime}
  </React.Fragment>
}

