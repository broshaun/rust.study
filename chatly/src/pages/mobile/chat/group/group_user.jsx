import { GroupMemberList } from "./ui/GroupMemberList"
import { useNavigate, useOutletContext, useParams } from "react-router";
import { currentAppBar, createHttpClient, currentModal } from "utils"
import { useEffect, useState, } from "react";
import { loginCache } from "cache/loginCache";
import { group_list } from "cache/group_list";


// 群成员列表
export const GroupUsers = () => {
    const { db } = useOutletContext();
    const currentUser = loginCache.get()
    const { http } = createHttpClient('/rpc/chat/group/');
    const { id: groupId } = useParams();

    const navigate = useNavigate();
    const setTitle = currentAppBar((state) => state.setTitle);
    const setLeftPath = currentAppBar((state) => state.setLeftPath);
    const setRightIcon = currentAppBar((state) => state.setRightIcon);
    const setRightPath = currentAppBar((state) => state.setRightPath);
    useEffect(() => {
        setTitle('群成员');
        setLeftPath(`/mobile/chat/group/msgs/${groupId}`)
        setRightIcon(null)
        setRightPath(null)
    }, [])

    const [members, setMembers] = useState([])
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
        setMembers(guser)
    }

    useEffect(() => {
        get_group_user(groupId).catch(console.error)
    }, [groupId])


    const { open, close } = currentModal();
    const leaveGroup = async ({ id }) => {
        const results = await http.requestBodyJson('group_ask_state', { id, ask_state: 'leave' })
        const { code, message, data } = results;
        if (code !== 200) {
            open({
                title: "邀请失败",
                message: message,
                onConfirm: () => close(),
                onCancel: null
            })
        }
        await navigate('/mobile/chat/group/');
    }

    return <div>
        <GroupMemberList
            members={members}
            onAddMember={() => navigate(`/mobile/chat/group/addgusr/${groupId}`)}
            onRemoveMember={() => navigate(`/mobile/chat/group/delgusr/${groupId}`)}
            onExitGroup={async () => {
                await db.table('groups').delete(groupId)
                await group_list.refresh();
                
                const id = members.find(item => item.user_id === currentUser?.id)?.id;
                await leaveGroup({ id })
            }}
        />
    </div>

}

