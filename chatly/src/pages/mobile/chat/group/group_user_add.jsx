import { useCallback, useEffect, useState } from "react";
import { useLocalStorage, useListState } from "@mantine/hooks";
import { getUserDB, currentGroup, useHttpClient, currentAppBar } from "utils";
import { useMutation } from "@tanstack/react-query";
import { useNavigate } from "react-router";
import { GroupMemberSelector } from "./UI/GroupMemberSelector";

export const AddMember = () => {

  // const setTitle = currentAppBar((state) => state.setTitle);
  const setLeftPath = currentAppBar((state) => state.setLeftPath);
  const setRightIcon = currentAppBar((state) => state.setRightIcon);
  const setRightPath = currentAppBar((state) => state.setRightPath);
  useEffect(() => {
    // setTitle('');
    setLeftPath('/mobile/chat/group/gusr/')
    setRightIcon(null)
    setRightPath(null)
  }, [])

  const { http } = useHttpClient('/rpc/chat/msg/group/');
  const [account] = useLocalStorage({ key: "savedAccount" });
  const db = getUserDB(account);

  const [friends, handlers] = useListState([]);
  useEffect(() => {
    if (!db) return;
    db.table("friends").where("ask_state").equals("agree").toArray().then((list) => {
      handlers.setState(list)
    })
  }, [db]);

  const { mutateAsync: addgusr } = useMutation({
    mutationFn: async ({ group_id, uids }) => {
      if (!group_id) return;
      const results = await http.requestBodyJson('group_user_add_list', { group_id, uids })
      const { code, message, data } = results;
      if (code !== 200) {
        throw new Error(message || "添加群成员");
      }
      return data || true;
    },
    onSuccess: (data) => {
      console.log("修改成功:", data);

    },
    onError: (error) => {
      console.error("修改失败:", error);
    },
  });

  const group = currentGroup((state) => state.current)
  const navigate = useNavigate();
  const handleConfirm = useCallback(async (value) => {
    const list = value?.users || []
    const uids = list.map(item => item.uid);
    await addgusr({ group_id: group.id, uids: uids })
    navigate('/mobile/chat/group/gusr/')
  }, [group, navigate, addgusr]);

  return (
    <GroupMemberSelector
      mode="add"
      users={friends}
      onConfirm={handleConfirm}
    />
  );
};