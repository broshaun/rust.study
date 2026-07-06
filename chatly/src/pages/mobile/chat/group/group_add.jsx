import { CreateGroupView } from "./ui/CreateGroupView"
import { currentAppBar, createHttpClient } from "utils";
import { useEffect } from "react";
import { useNavigate } from "react-router";
import { group_list2 } from "cache/group_list";

// 创建群
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
    const { http } = createHttpClient('/rpc/chat/group/')
    const createGroup = async ({ group_name }) => {
        const results = await http.requestBodyJson('create_group', { group_name })
        const { code, data } = results;
        if (code === 200) {
            await group_list2.refresh();
            await navigate('/mobile/chat/group/');
        }
        return data || true;
    }


    return <div>
        <CreateGroupView onCreateSuccess={(group) => { createGroup({ group_name: group?.group_name }) }} />
    </div>
}