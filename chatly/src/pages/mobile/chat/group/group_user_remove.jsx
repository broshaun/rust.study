import { useCallback, useEffect, useState } from "react";
import { createHttpClient, currentAppBar } from "utils";
import { useNavigate, useParams } from "react-router";
import { GroupMemberSelector } from "./ui/GroupMemberSelector";
import { agroup_user } from "cache/group_user";


export const DelMember = () => {
  const { id: groupId } = useParams();
  const setTitle = currentAppBar((state) => state.setTitle);
  const setLeftPath = currentAppBar((state) => state.setLeftPath);
  const setRightIcon = currentAppBar((state) => state.setRightIcon);
  const setRightPath = currentAppBar((state) => state.setRightPath);
  useEffect(() => {
    setLeftPath('/mobile/chat/group/gusr/')
    setTitle('删除群成员');
    setRightIcon(null)
    setRightPath(null)
  }, [])

  const { http } = createHttpClient('/rpc/chat/group/');
  const [gusrlist, setGusrlist] = useState([])
  const get_group_user = async (groupId) => {
    const results = await http.requestBodyJson("group_user_list", { "group_id": groupId });
    if (!results) throw new Error("获取失败");
    const { code, data, message } = results;
    if (code !== 200) throw new Error(message);
    const guser = data.map((item) => ({
      id: item.id,
      user_id: item.user_id,
      nickname: item.nickname,
      ask_state: item.ask_state,
      avatar_url: item.avatar_url,
    }));
    setGusrlist(guser)
  }

  useEffect(() => {
    get_group_user(groupId).catch(console.error)
  }, [groupId]);


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
    await get_group_user(groupId)
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