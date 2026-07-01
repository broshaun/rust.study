import React, { useEffect, useState } from "react";
import { useNavigate, useOutletContext, useParams } from "react-router";
import { createHttpClient, currentAppBar } from 'utils';
import { FriendInfo } from "./ui/FriendDetailUI";
import { friend_list } from "cache/friend_list";



export function Detail() {
  const { id: friendId } = useParams();
  const { db, readyData } = useOutletContext();
  const { http: http2 } = createHttpClient('/rpc/chat/friend/');
  const navigate = useNavigate();


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
    return () => {
      friend_list.refresh().catch(console.error)
    }
  }, [])

  // 获取用户信息
  const [friend, setFriend] = useState()
  async function get_friend(friendId) {
    if (!friendId) return;
    try {
      const results = await http2.getById(friendId);
      if (!results) throw new Error("获取失败");
      const { code, data } = results;
      if (code === 200) {
        setFriend(data)
      }
    } catch { }
  }

  useEffect(() => {
    get_friend(friendId).catch(console.error)
  }, [friendId])

  // 删除好友
  async function deleteFriend(id) {
    try {
      if (!id) return;
      await http2.requestBodyJson('DELETE', { id });
      await db.table('message').where('uid').equals(id).delete();
      await db.table('friends').where('id').equals(id).delete();
      await db.table('friends_dialog').where('id').equals(id).delete();
      await navigate("/mobile/chat/friend/");
      await get_friend(friendId)
    } catch (error) {
      console.error(error)
    }
  }

  // 更新备注
  async function updRemark({ id, remark }) {
    if (!id) return;
    await http2.requestBodyJson('set_friend', { id, remark });
    await get_friend(friendId)
  }

  async function openMsgWindow() {
    await navigate(`/mobile/chat/message/${friendId}`);
  }

  return (
    <FriendInfo
      friend={friend}
      onRemarkChange={(remark) => { updRemark({ id: friendId, remark }) }}
      onChat={openMsgWindow}
      onDelete={(friend) => { deleteFriend(friendId) }}
    />
  );
}