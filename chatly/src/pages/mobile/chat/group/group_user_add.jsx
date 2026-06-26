import { useCallback, useEffect, useState } from "react";
import { useListState } from "@mantine/hooks";
import { getUserDB, currentChat, createHttpClient, currentAppBar, currentModal } from "utils";
import { useNavigate } from "react-router";
import { GroupMemberSelector } from "./ui/GroupMemberSelector";
import { userId } from "utils/identity";


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

  const { http } = createHttpClient('/rpc/chat/group/');
  const db = getUserDB(userId.get());

  const [friends, handlers] = useListState([]);
  useEffect(() => {
    if (!db) return;
    db.table("friends").where("ask_state").equals("agree").toArray().then((list) => {
      handlers.setState(list)
    })
  }, [db]);


  const { open, close } = currentModal();
  const addgusr = async ({ group_id, uids }) => {
    if (!group_id) return;
    const results = await http.requestBodyJson('group_user_add_list', { group_id, uids })
    const { code, message, data } = results;
    if (code !== 200) {
      open({
        title: "邀请失败",
        message: message,
        onConfirm: () => close(),
        onCancel: null
      })
    }
    return data;
  }

  const navigate = useNavigate();
  const handleConfirm = useCallback(async (value) => {
    const { id: groupId } = currentChat.getState().get("group");
    if (!groupId) return;
    const users = Array.isArray(value?.users) ? value.users : [];
    const uids = users.map((item) => item.uid).filter(Boolean);
    if (!uids.length) return;
    await addgusr({ group_id: groupId, uids: uids })
    await navigate('/mobile/chat/group/gusr/')
  }, [navigate, addgusr]);

  return (
    <GroupMemberSelector
      mode="add"
      users={friends}
      onConfirm={handleConfirm}
    />
  );
};