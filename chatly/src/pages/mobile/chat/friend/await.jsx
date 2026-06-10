import React, { useEffect } from "react";
import { useHttpClient, currentAppBar } from "utils";
import { useMutation, useQuery } from "@tanstack/react-query";
import { FriendRequestList } from "./UI/FriendRequestList";
import { IconUserSearch } from "@tabler/icons-react";

export const FriendRequests = () => {
  const { http } = useHttpClient("/rpc/chat/friend/");

  const setTitle = currentAppBar((state) => state.setTitle);
  const setLeftPath = currentAppBar((state) => state.setLeftPath);
  const setRightIcon = currentAppBar((state) => state.setRightIcon);
  const setRightPath = currentAppBar((state) => state.setRightPath);

  useEffect(() => {
    setLeftPath("/mobile/chat/friend/");
    setTitle("好友请求");
    setRightIcon(<IconUserSearch/>);
    setRightPath('/mobile/chat/friend/find/');
  }, []);

  const {
    data: friendRequests = [],
    isPending: isLoadingRequests,
    refetch,
  } = useQuery({
    queryKey: ["friends-await"],
    queryFn: async () => {
      try {
        const { code, data } =
          await http.requestBodyJson(
            "get_await_friends",
            {}
          );

        return code === 200
          ? data || []
          : [];
      } catch (error) {
        console.error(error);
        return [];
      }
    },
  });

  const { mutateAsync: updateFriendRequest } =
    useMutation({
      mutationFn: async ({
        id,
        ask_state,
      }) => {
        if (!id || !ask_state) return;

        const result =
          await http.requestBodyJson(
            "PATCH",
            {
              id,
              ask_state,
            }
          );

        return result;
      },

      onSuccess: () => {
        refetch();
      },
    });

  return (
    <FriendRequestList
      isLoadingRequests={
        isLoadingRequests
      }
      friendRequests={
        friendRequests
      }
      onAcceptFriend={(user) =>
        updateFriendRequest({
          id: user.id,
          ask_state: "agree",
        })
      }
      onRejectFriend={(user) =>
        updateFriendRequest({
          id: user.id,
          ask_state: "refuse",
        })
      }
    />
  );
};