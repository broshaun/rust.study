import React, { Suspense } from "react";
import { useNavigate } from 'react-router';
import { createHttpClient, currentModal, tokenStore, closeUserDB, useReady } from 'utils';
import { useEffect } from "react";
import { queryClient } from "cache";
import { userId } from "utils/identity";



export const Logout = () => {
  const navigate = useNavigate();
  const { http } = createHttpClient('/rpc/chat/login/')
  const { ready, data: readyData } = useReady(() => {
    const uid = userId.get();
    if (uid) {
      return { uid };
    }
    return null;
  }, []);


  const logout = async () => {
    if (!ready) return;
    queryClient.clear()
    tokenStore.remove()
    closeUserDB(readyData?.uid)
    await http.post('DELETE');
    await navigate('/mobile/auth/user', { replace: true });
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

