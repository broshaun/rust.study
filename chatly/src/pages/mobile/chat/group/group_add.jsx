import { CreateGroupView } from "./ui/CreateGroupView"
import { currentAppBar, createHttpClient } from "utils";
import { useEffect } from "react";
import { useNavigate } from "react-router";
import { useLocalStorage } from "@mantine/hooks";
import { agroups } from "http/groups";


export function CreateGroup() {
    const setTitle = currentAppBar((state) => state.setTitle);
    const setLeftPath = currentAppBar((state) => state.setLeftPath);
    const setRightIcon = currentAppBar((state) => state.setRightIcon);
    const setRightPath = currentAppBar((state) => state.setRightPath);
    useEffect(() => {
        setTitle('创建群聊');
        setLeftPath('/mobile/chat/group/ingmsg/')
        setRightIcon(null)
        setRightPath(null)
    }, [])

    const navigate = useNavigate();
    const [userId] = useLocalStorage({ key: 'current_account' })
    const { http } = createHttpClient('/rpc/chat/msg/group/')
    const createGroup = async ({ group_name }) => {
        const results = await http.requestBodyJson('create_group', { group_name })
        const { code, message, data } = results;
        if (code === 200) {
            await agroups.refresh(userId);
            navigate('/mobile/chat/group/');
        }
        return data || true;
    }


    return <div>
        <CreateGroupView onCreateSuccess={(group) => { createGroup({ group_name: group?.group_name }) }} />
    </div>
}