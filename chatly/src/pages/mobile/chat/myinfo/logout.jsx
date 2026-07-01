import React, { Suspense } from "react";
import { useNavigate, useOutletContext } from 'react-router';
import { createHttpClient, currentModal, tokenStore, closeUserDB } from 'utils';
import { useEffect } from "react";
import { queryClient } from "cache";



export const Logout = () => {
  const navigate = useNavigate();
  const { http } = createHttpClient('/rpc/chat/login/')
  const { uid } = useOutletContext();

  const logout = async () => {
    queryClient.clear()
    tokenStore.remove()
    closeUserDB(uid)
    await http.post('DELETE');
    await navigate('/mobile/auth/user', { replace: true });
  }

  const { open } = currentModal();
  useEffect(() => {
    open({
      title: "登出",
      message: "退出当前账户？",
      onConfirm: async () => {
        console.log("确认退出");
        await logout();
      },
      onCancel: () => {
        navigate("/mobile/chat/self", { replace: true });
      }
    });
  }, [open, navigate]);

  return <Suspense fallback={<div>加载中...</div>} />
}

