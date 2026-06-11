import React, { useEffect } from "react";
import { useHttpClient, currentAppBar } from "utils";
import { FriendRequestList } from "./UI/FriendRequestList";
import { useLocalStorage } from "@mantine/hooks";
import { useQueryClient, useIsFetching, useMutation } from '@tanstack/react-query'


export const FriendRequests = () => {
  const { http } = useHttpClient("/rpc/chat/friend/");
  const [userId] = useLocalStorage({ key: 'current_account' })
  const queryClient = useQueryClient()
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

  const friendRequests = queryClient.getQueryData(["friends-await", userId]);
  const isRefetching = useIsFetching({ queryKey:["friends-await", userId] }) > 0;

  const { mutateAsync: updateFriendRequest } = useMutation({
    mutationFn: async ({ id, ask_state }) => {
      if (!id || !ask_state) return;
      const result = await http.requestBodyJson("PATCH", { id, ask_state, });
      return result;
    },
  });

  return (
    <FriendRequestList
      isRefetching={isRefetching}
      onRefetch={async () => {
        await queryClient.refetchQueries({ queryKey: ["friends-await", userId] })
      }}
      friendRequests={friendRequests}
      onAcceptFriend={(user) => updateFriendRequest({ id: user.id, ask_state: "agree" })}
      onRejectFriend={(user) => updateFriendRequest({ id: user.id, ask_state: "refuse" })}
    />
  );
};