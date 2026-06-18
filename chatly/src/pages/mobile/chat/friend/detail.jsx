import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router";
import { createHttpClient, currentAppBar, currentChat } from 'utils';
import { getUserDB } from "utils";
import { useLocalStorage } from '@mantine/hooks';
import { FriendInfo } from "./ui/FriendDetailUI";
import { afriends } from "http/friends";


export function Detail() {
  const { http: http2 } = createHttpClient('/rpc/chat/friend/');
  const navigate = useNavigate();
  const [userId] = useLocalStorage({ key: 'current_account' })
  const db = getUserDB(userId);
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

  useEffect(() => {
    if (!userId) return;
    return () => {
      afriends.refresh(userId).catch(console.error)
    }
  }, [userId])


  const current_friend = currentChat((state) => state.current.get("friend"));
  const friendId = current_friend?.id

  const [friend, setFriend] = useState()

  async function get_friend(friendId) {
    if (!friendId) return;
    try {
      const results = await http2.getById(friendId);
      if (!results) throw new Error("获取失败");
      const { code, data, message } = results;
      console.log('results',results)
      if (code === 200) {
        setFriend(data)
      }
    } catch { }
  }

  useEffect(() => {
    get_friend(friendId).catch(console.error)
  }, [friendId])


  async function deleteFriend(id) {
    try {
      if (!id) return;
      await http2.requestBodyJson('DELETE', { id });
      await db.table('message').where('uid').equals(id).delete();
      await db.table('friends').where('id').equals(id).delete();
      await db.table('friends_dialog').where('id').equals(id).delete();
      navigate("/mobile/chat/friend/");
      await get_friend()
    } catch (error) {
      console.error(error)
    }
  }

  // 更新备注
  async function updRemark({ id, remark }) {
    if (!id) return;
    await http2.requestBodyJson('set_friend', { id, remark });
    await afriends.refresh(userId)
    await get_friend(friendId)
  }

  async function openMsgWindow(friend) {
    if (!friend?.id) return;
    navigate('/mobile/chat/message/');
  }

  return (
    <FriendInfo
      friend={friend}
      onRemarkChange={(remark) => { updRemark({ id: friend.id, remark }) }}
      onChat={openMsgWindow}
      onDelete={(friend) => { deleteFriend(friend.id) }}
    />
  );
}