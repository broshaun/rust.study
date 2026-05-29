import { GroupInviteMessageList } from "./UI/InviteGroupCard";
import { currentAppBar, useHttpClient } from "utils";
import { useEffect,useState } from "react";
import { IconCirclePlus } from "@tabler/icons-react";


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
        setTitle('群消息')
        setLeftPath('/mobile/chat/group/')
        setRightIcon(<IconCirclePlus />)
        setRightPath('/mobile/chat/group/addg/')
    }, [])


    return <div>
        <GroupInviteMessageList data={data} loading={loading} />
    </div>
}