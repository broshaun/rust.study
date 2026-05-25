import { useCallback, useEffect, useState } from "react";
import { useLocalStorage } from "@mantine/hooks";
import { GroupAddMember } from "./UI/GroupAdd";
import { getUserDB, currentGroup, useHttpClient } from "utils";
import { useMutation } from "@tanstack/react-query";



export const AddMember = () => {

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
      // navigate('/mobile/chat/group/',)
    },
    onError: (error) => {
      console.error("修改失败:", error);
    },
  });

  const group = currentGroup((state) => state.current)
  const handleConfirm = useCallback((value) => {
    console.log("确认添加:", value);
    console.log('group++++', group)

    addgusr({group_id:group.id,uids:value})
  }, [group]);

  return (
    <GroupAddMember
      users={friends}
      onConfirm={handleConfirm}
    />
  );
};