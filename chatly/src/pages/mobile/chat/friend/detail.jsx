import React, { useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router";
import { useHttpClient, currentAppBar } from 'utils';
import { getUserDB } from "utils";
import { useMutation } from '@tanstack/react-query';
import { useLocalStorage } from '@mantine/hooks';
import { FriendInfo } from "./UI/FriendInfoUI";


export function Detail() {
  const setTitle = currentAppBar((state) => state.setTitle);
  const setLeftPath = currentAppBar((state) => state.setLeftPath);
  const setRightIcon = currentAppBar((state) => state.setRightIcon);
  const setRightPath = currentAppBar((state) => state.setRightPath);

  useEffect(() => {
    setLeftPath('/mobile/chat/friend/')
    setTitle('好友信息');
    setRightIcon(null)
    setRightPath(null)
  }, [])

  const navigate = useNavigate();
  const location = useLocation();
  const [account] = useLocalStorage({ key: 'current_account' })
  const [friend, setFriend] = useState(location.state?.select);
  const db = getUserDB(account);

  useEffect(() => {
    setFriend(location.state?.select)
  }, [location.state?.select])

  const { http: http2 } = useHttpClient('/rpc/chat/friend/');

  // 删除好友
  const { mutateAsync: delFid } = useMutation({
    mutationFn: async (id) => {
      if (!id) return;
      await http2.requestBodyJson('DELETE', { id });
      const row = await db.table('friends').get(id);
      await Promise.all([
        db.table('message').where('uid').equals(row?.uid).delete(),
        db.table('friends').delete(id),
      ]);
      return 'ok';
    },
  });

  // 更新备注
  const { mutateAsync: updRemark } = useMutation({
    mutationFn: async ({ id, remark }) => {
      if (!id) return;
      await http2.requestBodyJson('PATCH', { id, remark });
      await db.table('friends').update(id, { remark });
      return 'ok';
    },
  });

  function openMsgWindow(friend) {
    if (!friend?.id) return;
    const displayName = friend.remark ?? friend.nickname ?? friend.email ?? friend.id;
    db.table('friends').update(friend.id, { signal: 'old', dialog: 1 });
    navigate('/mobile/chat/message/', {
      state: { uid: friend.uid, avatar_url: friend.avatar_url, displayName },
    });
  }

  return (

    <FriendInfo
      friend={friend}
      onRemarkChange={(remark) => {
        setFriend((p) => ({
          ...p,
          remark,
        }));

        updRemark({
          id: friend.id,
          remark,
        });
      }}
      onChat={openMsgWindow}
      onDelete={(friend) => {
        delFid(friend.id).then(() => {
          navigate("/mobile/chat/friend/");
        });
      }}
    />
  );
}