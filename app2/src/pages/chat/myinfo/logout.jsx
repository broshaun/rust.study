import React, { useEffect, useState, useReducer, Suspense } from 'react';
import { useNavigate, useLocation, useOutletContext } from 'react-router-dom';
import { useLogin, useUser, useHttpClient } from 'hooks';
import { Modal } from 'components';


export const Logout = () => {
  const navigate = useNavigate();
  const location = useLocation()
  const { fnLogout } = useLogin();
  const { delUser } = useUser();
  const { http } = useHttpClient('/api/chat/login/')
  const [open, setOpen] = useState(true);


  // 操作按钮YES触发执行：
  const logout = () => {
    http.requestParams('DELETE').catch(console.error);
    fnLogout()
    delUser()
    navigate('/user/login/', { replace: true });
  }


  return <Suspense>
    <Modal visible={open}>
      <Modal.Title>登出</Modal.Title>
      <Modal.Message>退出当前账户？</Modal.Message>
      <Modal.Confirm onClick={() => { setOpen(false); logout(); }}>确定</Modal.Confirm>
      <Modal.Cancel onClick={() => { setOpen(false);navigate('/chat/self/mylist/') }}>取消</Modal.Cancel>
    </Modal>
  </Suspense>
}

