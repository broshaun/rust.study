import { useCallback, useEffect } from "react";
import { createHttpClient, currentAppBar, currentModal } from "utils";
import { useNavigate, useOutletContext, useParams } from "react-router";
import { GroupMemberSelector } from "./ui/GroupMemberSelector";
import { useLiveQuery } from "dexie-react-hooks";
// import { }


// 群聊，添加群成员
export const AddMember = () => {
  const { id: groupId } = useParams();
  const { db } = useOutletContext();

  const setTitle = currentAppBar((state) => state.setTitle);
  const setLeftPath = currentAppBar((state) => state.setLeftPath);
  const setRightIcon = currentAppBar((state) => state.setRightIcon);
  const setRightPath = currentAppBar((state) => state.setRightPath);
  useEffect(() => {
    setTitle('添加群成员');
    setLeftPath(`/mobile/chat/group/gusr/${groupId}`)
    setRightIcon(null)
    setRightPath(null)
  }, [])

  const { http } = createHttpClient('/rpc/chat/group/');


  const friends = useLiveQuery(async () => {
    if (!db) return;
    const { data: friends = [] } = await db.cache.get('my_friends')
    return friends
  }, [db], []);


  const { open, close } = currentModal();
  const addgusr = async ({ group_id, uids }) => {
    console.log('group_id',group_id)
    console.log('uids',uids)


    if (!group_id) return;
    const results = await http.requestBodyJson('group_user_add_list', { group_id, uids })
    const { code, message, data } = results;
    // console.log('results++', results)
    if (code !== 200) {
      open({
        title: "邀请失败",
        message: message,
        onConfirm: () => close(),
        onCancel: null
      })
    }

  }

  const navigate = useNavigate();
  const handleConfirm = useCallback(async (value) => {
    if (!groupId) return;
    const users = Array.isArray(value?.users) ? value.users : [];
    const uids = users.map((item) => item.uid).filter(Boolean);
    if (!uids.length) return;
    await addgusr({ group_id: groupId, uids: uids })
    await navigate(`/mobile/chat/group/gusr/${groupId}`)
  }, [navigate, addgusr, groupId]);

  return (
    <GroupMemberSelector
      mode="add"
      users={friends}
      onConfirm={handleConfirm}
    />
  );
};