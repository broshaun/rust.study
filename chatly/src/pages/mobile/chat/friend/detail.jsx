import React, { useEffect } from "react";
import { useNavigate } from "react-router";
import { useHttpClient, currentAppBar, currentChat } from 'utils';
import { getUserDB } from "utils";
import { useMutation, useQuery } from '@tanstack/react-query';
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
  const [userId] = useLocalStorage({ key: 'current_account' })
  const db = getUserDB(userId);


  const { http: http2 } = useHttpClient('/rpc/chat/friend/');


  const current_friend = currentChat(
    (state) => state.current.get("friend")
  );
  const friendId = current_friend?.id

  const { data: friend, refetch } = useQuery({
    queryKey: ["get_friend", userId, friendId],
    queryFn: async () => {
      const results = await http2.getById(friendId);
      if (!results) throw new Error("获取失败");
      const { code, data, message } = results;
      console.log('results', results)
      if (code !== 200) {
        return {}
      }
      return data || {};
    },
    staleTime: 1000 * 3600 * 1,
    gcTime: 1000 * 3600 * 12,
    enabled: !!userId && !!friendId,
    refetchOnWindowFocus: false,
  })

  const { mutateAsync: delFid } = useMutation({
    mutationFn: async (id) => {
      if (!id) return;
      await http2.requestBodyJson('DELETE', { id });
      await db.table('message').where('uid').equals(id).delete();
      await db.table('dialog').where('id').equals(id).delete();
      return 'ok';
    },
    onSuccess: () => {
      refetch()
    },
  });

  // 更新备注
  const { mutateAsync: updRemark } = useMutation({
    mutationFn: async ({ id, remark }) => {
      if (!id) return;
      await http2.requestBodyJson('PATCH', { id, remark });
      return 'ok';
    },
    onSuccess: () => {
      refetch()
    },
  });

  async function openMsgWindow(friend) {
    if (!friend?.id) return;
    navigate('/mobile/chat/message/');
  }

  return (
    <FriendInfo
      friend={friend}
      onRemarkChange={(remark) => {
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