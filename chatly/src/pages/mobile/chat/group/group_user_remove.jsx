import { useCallback, useEffect, useState } from "react";
import { useLocalStorage } from "@mantine/hooks";
import { currentChat, createHttpClient, currentAppBar } from "utils";
import { useNavigate } from "react-router";
import { GroupMemberSelector } from "./ui/GroupMemberSelector";
import { agroup_user } from "cache/group_user";


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

  const { http } = createHttpClient('/rpc/chat/msg/group/');
  const [userId] = useLocalStorage({ key: "current_account" });


  const [gusrlist, setGusrlist] = useState([])
  useEffect(() => {
    if (!userId) return;
    let isMounted = true;
    agroup_user.fetch(userId).catch(() => { });
    const unsubscribe = agroup_user.subscribe(userId, (next) => {
      if (!isMounted) return;
      const newData = Array.isArray(next?.data) ? next.data : [];
      setGusrlist(newData);
    });
    return () => {
      isMounted = false;
      unsubscribe?.();
    }
  }, [userId]);


  const delgusr = async ({ ids }) => {
    if (!ids) return;
    const results = await http.requestBodyJson('group_user_del_list', { ids })
    const { code, message, data } = results;
    if (code !== 200) {
      throw new Error(message || "添加群成员");
    }
    return data || true;
  }

  const navigate = useNavigate();
  const handleConfirm = useCallback(async (value) => {
    const list = value?.users || []
    const ids = list.map(item => item.id);
    await delgusr({ ids: ids })
    await agroup_user.refresh()
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