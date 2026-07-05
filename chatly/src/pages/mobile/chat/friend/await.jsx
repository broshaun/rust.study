import React, { useEffect, useState } from "react";
import { createHttpClient, currentAppBar } from "utils";
import { FriendRequestList } from "./ui/FriendRequestList";
import { friend_await_message } from "cache/friend_await_message";
import { IconUserPlus } from "@tabler/icons-react";


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

  const [friendRequests, setFriendRequests] = useState([])
  const [isFetching, setIsFetching] = useState(false);
  useEffect(() => {
    let isMounted = true;
    friend_await_message.fetch().catch(() => { });
    const unsubscribe = friend_await_message.subscribe((next) => {
      if (!isMounted) return;
      setIsFetching(!!next?.isFetching);
      if (!next?.isSuccess) return;
      setFriendRequests(next.data);
    });
    return () => {
      isMounted = false;
      unsubscribe?.();
    }
  }, []);


  async function updateFriendRequest({ id, ask_state }) {
    if (!id || !ask_state) return;
    const result = await http.requestBodyJson("PATCH", { id, ask_state, });
    return result;

  }


   console.log('friendRequests++',friendRequests)

  return (
    <FriendRequestList
      isRefetching={isFetching}
      onRefetch={async () => {await friend_await_message.refresh()}}
      friendRequests={friendRequests}
      onAcceptFriend={(user) => updateFriendRequest({ id: user.id, ask_state: "agree" })}
      onRejectFriend={(user) => updateFriendRequest({ id: user.id, ask_state: "refuse" })}
    />
  );
};