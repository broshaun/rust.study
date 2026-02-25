import React, { useState, Suspense } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useLogin, useUser, useHttpClient } from 'hooks';
import { Modal } from 'components';
import { db } from 'hooks/db';

export const Logout = () => {
  const navigate = useNavigate();
  const location = useLocation()
  const { fnLogout } = useLogin();
  const { delUser } = useUser();
  const { http } = useHttpClient('/api/chat/login/')
  const [open, setOpen] = useState(true);



  const logout = () => {
    http.requestParams('DELETE').catch(console.error);
    fnLogout()
    delUser()
    db.close()
    db.delete().then(console.log('chatDB数据清空'))
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

