import React, { useEffect } from "react";
import { createHttpClient, currentAppBar } from "utils";
import { FriendRequestList } from "./ui/FriendRequestList";
import { useLocalStorage } from "@mantine/hooks";
import { afriends } from "cache/friendsAwait";
import { useQueryCache } from "cache/useQueryCache";

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





  const { data: friendRequests, isFetching } = useQueryCache(afriends,userId)
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