import { currentAppBar, useDateTime } from "utils";
import { useCallback, useEffect, useState } from "react";
import { useNavigate, useOutletContext } from "react-router";
import { IconUsers, IconMessageUser } from "@tabler/icons-react";
import { GroupList } from "./ui/GroupList";
import { useLiveQuery } from "dexie-react-hooks";
import { loginCache2 } from "cache/loginCache";
import { group_invite_msg } from "cache/group_invite_msg";
import { useRequest } from "ahooks";


// 群聊列表
export const Item = () => {
    const { db } = useOutletContext();
    const { data: usrInfo, loading } = useRequest(loginCache2.get, {
        manual: false
    })


    // console.log('usrInfo+++', usrInfo)

    const dt = useDateTime();
    const setTitle = currentAppBar((state) => state.setTitle);
    const setLeftPath = currentAppBar((state) => state.setLeftPath);
    const setRightIcon = currentAppBar((state) => state.setRightIcon);
    const setRightPath = currentAppBar((state) => state.setRightPath);

    const [RIcon, setRIcon] = useState(<IconUsers />);
    useEffect(() => {
        setTitle('群聊')
        setLeftPath(null)
        setRightIcon(RIcon)
        setRightPath('/mobile/chat/group/ingmsg/')
    }, [RIcon])



    useEffect(() => {
        const unsubscribe = group_invite_msg.subscribe((state) => {
            if (!state.isSuccess) return;
            const isInvite = state.data.some(({ ask_state = [] }) => (ask_state?.includes("invite") && !ask_state?.includes("agreed")))
            if (isInvite) {
                setRIcon(<IconMessageUser color="red" />)
            } else {
                setRIcon(<IconUsers />)
            }
        })
        return () => unsubscribe;
    }, [])


    const navigate = useNavigate();
    // 打开群聊
    const openGroup = async (value) => {
        db.table("groups_dialog").put({ id: value?.id, signal: 'old', timestamp: dt.getDateTimeStr() }).catch(console.error);
        await navigate(`/mobile/chat/group/msgs/${value?.id}`)
    }


    // 点击群头像
    const openGroupInfo = useCallback(async (value) => {
        if (loading) return;
        const list = value?.administrator || [];
        if (list.includes(usrInfo?.id)) {
            navigate(`/mobile/chat/group/update/${value?.id}`)
        }
    }, [loading])

    const finalGroups = useLiveQuery(async () => {
        if (!db) return;
        const { data: groups = [] } = await db.cache.get('my_group_list')
        const dialog = await db.table("groups_dialog").toArray()
        const groupMap = new Map(dialog.map(item => [item.id, item]))
        const a = groups.map(group => ({ ...group, ...groupMap.get(group.id) })).sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp))
        return a
    }, [db], []);


    // console.log('finalGroups', finalGroups)

    return (
        <GroupList
            groups={finalGroups}
            onSelect={openGroup}
            onAvatarClick={openGroupInfo}
        />
    );
}