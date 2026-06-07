import { GroupInviteMessageList } from "./UI/InviteGroupCard";
import { currentAppBar, useHttpClient } from "utils";
import { useEffect, useState } from "react";
import { IconCirclePlus } from "@tabler/icons-react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useLocalStorage } from "@mantine/hooks";



export function InviteGroup() {
    const setTitle = currentAppBar((state) => state.setTitle);
    const setLeftPath = currentAppBar((state) => state.setLeftPath);
    const setRightIcon = currentAppBar((state) => state.setRightIcon);
    const setRightPath = currentAppBar((state) => state.setRightPath);

    const { http } = useHttpClient('/rpc/chat/msg/group/');
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
        setRightIcon(<IconCirclePlus />)
        setRightPath('/mobile/chat/group/addg/')
    }, [])


    const queryClient = useQueryClient();
    const [userId] = useLocalStorage({ key: 'current_account' })
    const updateGroupAskState = useMutation({
        mutationFn: async ({ id, ask_state }) => {
            const results = await http.requestBodyJson(
                "group_ask_state",
                { id, ask_state }
            );

            if (results?.code !== 200) {
                throw new Error(results?.message);
            }

            return results.data;
        },
        onSuccess: (data) => {
            // console.log("操作成功:", data);
            queryClient.invalidateQueries({ queryKey: ["my_group_list", userId] })
        }
    });


    return <div>
        <GroupInviteMessageList data={data} loading={loading}
            onAccept={(value) => { updateGroupAskState.mutate({ "id": value?.id, "ask_state": "agreed" }) }}
            onReject={(value) => { updateGroupAskState.mutate({ "id": value?.id, "ask_state": "refuse" }) }}
        />
    </div>
}