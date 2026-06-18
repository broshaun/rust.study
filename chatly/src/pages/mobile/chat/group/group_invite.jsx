import { GroupInviteMessageList } from "./ui/InviteGroupCard";
import { currentAppBar, createHttpClient } from "utils";
import { useEffect, useState } from "react";
import { IconUsersPlus } from "@tabler/icons-react";
import { useLocalStorage } from "@mantine/hooks";
import { agroups } from "cache/groups";


export function InviteGroup() {
    const setTitle = currentAppBar((state) => state.setTitle);
    const setLeftPath = currentAppBar((state) => state.setLeftPath);
    const setRightIcon = currentAppBar((state) => state.setRightIcon);
    const setRightPath = currentAppBar((state) => state.setRightPath);

    const { http } = createHttpClient('/rpc/chat/msg/group/');
    const groupInviteMsg = async () => {
        const results = await http.requestBodyJson('group_admin_invite_msg', {})
        if (results?.code !== 200) {
            throw new Error(results?.message);
        }
        return results.data
    }

    const [data, setData] = useState([]);
    const [loading, setLoading] = useState(false);
    useEffect(() => {
        setLoading(true);
        groupInviteMsg()
            .then(setData)
            .finally(() => setLoading(false));
    }, []);

    useEffect(() => {
        setTitle('群邀请')
        setLeftPath('/mobile/chat/group/')
        setRightIcon(<IconUsersPlus />)
        setRightPath('/mobile/chat/group/addg/')
    }, [])

    const [userId] = useLocalStorage({ key: 'current_account' })
    const updateGroupAskState = async ({ id, ask_state }) => {
        const results = await http.requestBodyJson("group_ask_state", { id, ask_state });
        if (results?.code === 200) {
            await agroups.refresh(userId)
            return results?.data;
        }
        return []
    }

    return <div>
        <GroupInviteMessageList data={data} loading={loading}
            onAccept={(value) => { updateGroupAskState.mutate({ "id": value?.id, "ask_state": "agreed" }) }}
            onReject={(value) => { updateGroupAskState.mutate({ "id": value?.id, "ask_state": "refuse" }) }}
        />
    </div>
}