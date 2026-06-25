import React, { Suspense } from "react";
import { useNavigate } from 'react-router';
import { createHttpClient, currentModal, tokenStore } from 'utils';
import { useEffect } from "react";
import { queryClient } from "cache";



export const Logout = () => {
  const navigate = useNavigate();
  const { http } = createHttpClient('/rpc/chat/login/')

  const logout = () => {
    queryClient.clear()
    tokenStore.remove()
    http.post('DELETE').catch(console.error);
    navigate('/mobile/auth/user', { replace: true });
  }

  const { open } = currentModal();
  useEffect(() => {
    open({
      title: "登出",
      message: "退出当前账户？",
      onConfirm: () => {
        console.log("确认退出");
        logout();
      },
      onCancel: () => {
        navigate("/mobile/chat/self", { replace: true });
      }
    });
  }, [open, navigate]);

  return <Suspense fallback={<div>加载中...</div>} />
}

