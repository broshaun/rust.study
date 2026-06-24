import React, { useEffect, useState } from "react";
import { createHttpClient, currentAppBar } from "utils";
import { FriendRequestList } from "./ui/FriendRequestList";
import { useLocalStorage } from "@mantine/hooks";
import { afriends } from "cache/friendsAwait";

export const FriendRequests = () => {
  const { http } = createHttpClient("/rpc/chat/friend/");
  const [userId] = useLocalStorage({ key: 'current_account' })
  const setTitle = currentAppBar((state) => state.setTitle);
  const setLeftPath = currentAppBar((state) => state.setLeftPath);
  const setRightIcon = currentAppBar((state) => state.setRightIcon);
  const setRightPath = currentAppBar((state) => state.setRightPath);

  useEffect(() => {
    setLeftPath("/mobile/chat/friend/");
    setTitle("好友请求");
    setRightIcon(null);
    setRightPath(null);
  }, []);

    const [friendRequests, setFriendRequests] = useState([])
    const [isFetching, setIsFetching] = useState(false);
    useEffect(() => {
        if (!userId) return;
        let isMounted = true;
        afriends.fetch(userId).catch(() => { });
        const unsubscribe = afriends.subscribe(userId, (next) => {
            if (!isMounted) return;
            setIsFetching(!!next?.isFetching);
            const listData = Array.isArray(next?.data) ? next.data : [];
            setFriendRequests(listData);
        });
        return () => {
            isMounted = false;
            unsubscribe?.();
        }
    }, [userId]);


  async function updateFriendRequest({ id, ask_state }) {
    if (!id || !ask_state) return;
    const result = await http.requestBodyJson("PATCH", { id, ask_state, });
    return result;

  }

  return (
    <FriendRequestList
      isRefetching={isFetching}
      onRefetch={async () => {
        await afriends.refresh(userId)
      }}
      friendRequests={friendRequests}
      onAcceptFriend={(user) => updateFriendRequest({ id: user.id, ask_state: "agree" })}
      onRejectFriend={(user) => updateFriendRequest({ id: user.id, ask_state: "refuse" })}
    />
  );
};