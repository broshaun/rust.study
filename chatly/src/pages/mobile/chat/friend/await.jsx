import React, { useEffect, useState } from "react";
import { createHttpClient, currentAppBar } from "utils";
import { FriendRequestList } from "./ui/FriendRequestList";
import { afriends } from "cache/friendsAwait";

export const FriendRequests = () => {
  const { http } = createHttpClient("/rpc/chat/friend/");
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
        let isMounted = true;
        afriends.fetch().catch(() => { });
        const unsubscribe = afriends.subscribe((next) => {
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

  return (
    <FriendRequestList
      isRefetching={isFetching}
      onRefetch={async () => {
        await afriends.refresh()
      }}
      friendRequests={friendRequests}
      onAcceptFriend={(user) => updateFriendRequest({ id: user.id, ask_state: "agree" })}
      onRejectFriend={(user) => updateFriendRequest({ id: user.id, ask_state: "refuse" })}
    />
  );
};