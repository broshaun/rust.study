import React, { useState, Suspense } from 'react';
import { useNavigate } from 'react-router-dom';
import { Modal } from 'components';
import { useHttpClient2 } from 'hooks/http';
import { useToken } from "hooks"

export const Logout = () => {
  const navigate = useNavigate();
  const { delToken } = useToken();
  const { http } = useHttpClient2('/rpc/chat/login/')
  const [open, setOpen] = useState(true);



  const logout = () => {
    http.post('DELETE').catch(console.error);
    delToken()
    navigate('/user/login/', { replace: true });
  }


  return <Suspense>
    <Modal visible={open}>
      <Modal.Title>登出</Modal.Title>
      <Modal.Message>退出当前账户？</Modal.Message>
      <Modal.Confirm onClick={() => { setOpen(false); logout(); }}>确定</Modal.Confirm>
      <Modal.Cancel onClick={() => { setOpen(false); navigate('/chat/self/mylist/') }}>取消</Modal.Cancel>
    </Modal>
  </Suspense>
}

