import React, { useEffect, useState } from "react";
import { createHttpClient, currentAppBar } from "utils";
import { FriendRequestList } from "./ui/FriendRequestList";
import { friend_await_message } from "cache/friend_await_message";
import { IconUserPlus } from "@tabler/icons-react";
import { friend_list2 } from "cache/friend_list";
import { useRequest } from "ahooks";
import { userId } from "utils/identity";


export const loaderFriendAwait = async () => {
  const uid = userId.get();
  await friend_await_message.fetch()
  return { uid }
}


export const FriendRequests = () => {
  const { http } = createHttpClient("/rpc/chat/friend/");
  const setTitle = currentAppBar((state) => state.setTitle);
  const setLeftPath = currentAppBar((state) => state.setLeftPath);
  const setRightIcon = currentAppBar((state) => state.setRightIcon);
  const setRightPath = currentAppBar((state) => state.setRightPath);

  useEffect(() => {
    setLeftPath("/mobile/chat/friend/");
    setTitle("好友请求");
    setRightIcon(<IconUserPlus />)
    setRightPath('/mobile/chat/friend/find/')
  }, []);

  const [loading, setLoding] = useState(false)
  const [friendRequests, setFriendRequests] = useState([])
  useEffect(() => {
    const unsubscribe = friend_await_message.subscribe((next) => {
      setLoding(next?.isFetching)
      if (!next?.isSuccess) return;
      setFriendRequests(next.data);
    });
    return unsubscribe
  }, []);

  // 处理朋友请求
  const { runAsync } = useRequest(
    async ({ id, ask_state }) => {
      if (!id || !ask_state) new Error('异常参数');
      const result = await http.requestBodyJson("PATCH", { id, ask_state });
      return result;
    },
    {
      manual: true,
      onError: console.error,
      onSuccess: async () => {
        await friend_await_message.refresh()
        await friend_list2.refresh()
      }
    }
  )


  return (
    <FriendRequestList
      isLoadingRequests={loading}
      onRefetch={() => friend_await_message.refresh()}
      friendRequests={friendRequests}
      onAcceptFriend={(user) => runAsync({ id: user.id, ask_state: "agree" })}
      onRejectFriend={(user) => runAsync({ id: user.id, ask_state: "refuse" })}
    />
  );
};