import { useCallback, useEffect, useState } from "react";
import { useLocalStorage } from "@mantine/hooks";
import { currentChat, useHttpClient, currentAppBar } from "utils";
import { useMutation, useQuery } from "@tanstack/react-query";
import { useNavigate } from "react-router";
import { GroupMemberSelector } from "./UI/GroupMemberSelector";

export const DelMember = () => {
  
  // const setTitle = currentAppBar((state) => state.setTitle);
  const setLeftPath = currentAppBar((state) => state.setLeftPath);
  const setRightIcon = currentAppBar((state) => state.setRightIcon);
  const setRightPath = currentAppBar((state) => state.setRightPath);
  useEffect(() => {
    setLeftPath('/mobile/chat/group/gusr/')
    // setTitle('');
    setRightIcon(null)
    setRightPath(null)
  }, [])

  const { http } = useHttpClient('/rpc/chat/msg/group/');
  const [account] = useLocalStorage({ key: "current_account" });
  const {
    data: gusrlist = [],
    refetch,
  } = useQuery({
    queryKey: ["group_user_list", account],
    queryFn: async () => {
      const {id:groupId} = currentChat.getState().get("group")
      const results = await http.requestBodyJson("group_user_list", { "group_id": groupId });
      if (!results) throw new Error("获取失败");
      const { code, data, message } = results;
      if (code !== 200) throw new Error(message);
      return data || [];
    },
    staleTime: 1000 * 60 * 5, // 5分钟内认为缓存有效
    gcTime: 1000 * 60 * 30, // 缓存保留30分钟
    select: (data) =>
      data.map((item) => ({
        id: item.id,
        uid: item.user_id,
        nickname: item.nickname,
        ask_state: item.ask_state,
        avatar_url: item.avatar_url,
      }))
  });

  const { mutateAsync: delgusr } = useMutation({
    mutationFn: async ({ ids }) => {
      if (!ids) return;
      const results = await http.requestBodyJson('group_user_del_list', { ids })
      const { code, message, data } = results;
      if (code !== 200) {
        throw new Error(message || "添加群成员");
      }
      return data || true;
    },
    onSuccess: (data) => {
      console.log("删除成功:", data);

    },
    onError: (error) => {
      console.error("删除失败:", error);
    },
  });

  const navigate = useNavigate();
  const handleConfirm = useCallback(async (value) => {
    const list = value?.users || []
    const ids = list.map(item => item.id);
    await delgusr({ ids: ids })
    await refetch()
    await navigate('/mobile/chat/group/gusr/')

  }, [navigate]);

  return (
    <GroupMemberSelector
      mode="remove"
      users={gusrlist}
      onConfirm={handleConfirm}
    />
  );
};