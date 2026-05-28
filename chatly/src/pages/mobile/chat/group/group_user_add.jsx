import { useCallback, useEffect, useState } from "react";
import { useLocalStorage } from "@mantine/hooks";
import { getUserDB, currentGroup, useHttpClient, currentAppBar } from "utils";
import { useMutation } from "@tanstack/react-query";
import { useNavigate } from "react-router";
import { GroupMemberSelector } from "./UI/GroupMemberSelector";

export const AddMember = () => {
  const navigate = useNavigate();
  const setTitle = currentAppBar((state) => state.setTitle);
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
  const [account] = useLocalStorage({ key: "savedAccount" });
  const [friends, setFriends] = useState([]);

  useEffect(() => {
    let cancelled = false;

    const loadFriends = async () => {
      if (!account) {
        setFriends([]);
        return;
      }

      try {
        const db = getUserDB(account);
        if (!db) return;

        const list = await db
          .table("friends")
          .where("ask_state")
          .equals("agree")
          .toArray();

        if (!cancelled) {
          setFriends(list);
        }
      } catch (err) {
        console.error("加载好友失败:", err);
        if (!cancelled) {
          setFriends([]);
        }
      }
    };

    loadFriends();

    return () => {
      cancelled = true;
    };
  }, [account]);






  // 删除好友逻辑
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
  const handleConfirm = useCallback(async (value) => {
    const list = value?.users || []
    console.log('list+++',list)
    const uids = list.map(item => item.uid);
    console.log('uids+++',uids)
    await addgusr({ group_id: group.id, uids: uids })
    navigate('/mobile/chat/group/gusr/')
  }, [group,navigate,addgusr]);

  return (
    <GroupMemberSelector
      mode="add"
      users={friends}
      onConfirm={handleConfirm}
    />
  );
};