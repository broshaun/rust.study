import { GroupMemberList } from "./ui/GroupMemberList"
import { useNavigate } from "react-router";
import { currentAppBar, createHttpClient } from "utils"
import { useEffect, useState,  } from "react";
import { loginCache } from "cache/loginCache";
import { agroup_user } from "cache/group_user";

export const GroupUsers = () => {
    const navigate = useNavigate();
    const setTitle = currentAppBar((state) => state.setTitle);
    const setLeftPath = currentAppBar((state) => state.setLeftPath);
    const setRightIcon = currentAppBar((state) => state.setRightIcon);
    const setRightPath = currentAppBar((state) => state.setRightPath);
    useEffect(() => {
        setTitle('群成员');
        setLeftPath('/mobile/chat/group/msgs')
        setRightIcon(null)
        setRightPath(null)
    }, [])

    const { http } = createHttpClient('/rpc/chat/group/')
    const currentUser = loginCache.get()
    const [members, setMembers] = useState([])
    useEffect(() => {
        let isMounted = true;
        agroup_user.fetch().catch(() => { });
        const unsubscribe = agroup_user.subscribe((next) => {
            if (!isMounted) return;
            const newData = Array.isArray(next?.data) ? next.data : [];
            setMembers(newData);
        });
        return () => {
            isMounted = false;
            unsubscribe?.();
        }
    }, []);



    const leaveGroup = async ({ id }) => {
        const results = await http.requestBodyJson('group_ask_state', { id, ask_state: 'leave' })
        const { code, message, data } = results;
        if (code !== 200) {
            throw new Error(message);
        }
        await agroup_user.refresh()
        navigate('/mobile/chat/group/');
        return data;
    }


    // console.log('members', members)

    return <div>
        <GroupMemberList
            members={members}
            onAddMember={() => navigate('/mobile/chat/group/addgusr/')}
            onRemoveMember={() => navigate('/mobile/chat/group/delgusr/')}
            onExitGroup={() => {
                const id = members.find(item => item.uid === currentUser?.id)?.id;
                leaveGroup({ id })
            }}
        />
    </div>

}

