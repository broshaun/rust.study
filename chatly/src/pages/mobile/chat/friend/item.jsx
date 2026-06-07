import React, { useEffect, useCallback, useMemo } from "react";
import { useNavigate } from 'react-router';
import { currentAppBar, useHttpClient, friendStore, currentChat } from "utils";
import { useQuery } from '@tanstack/react-query'
import { useLocalStorage } from '@mantine/hooks';
import { IconCirclePlus } from "@tabler/icons-react";
import { FriendList } from "./UI/FriendList";


export const Item = () => {
    const navigate = useNavigate();
    const [userId] = useLocalStorage({ key: 'current_account' })
    const { http } = useHttpClient('/rpc/chat/friend/')

    const openMsgWindow = useCallback((select) => {
        const displayName = select.remark ?? select.nickname ?? select.email ?? select.id;
        currentChat.getState().set('friend', { id: select?.id, uid: select?.uid, displayName: displayName, avatar_url: select?.avatar_url })
        navigate('/mobile/chat/friend/detail/');
    }, [navigate]);

    const getfriend = async () => {
        const results = await http.requestBodyJson("GET");
        if (!results) throw new Error("获取失败");
        const { code, data, message } = results;
        console.log('results', results)
        if (code !== 200) {
            console.log(message)
            return []
        };
        return data?.detail || [];
    }

    const { data: friendList, isSuccess } = useQuery({
        queryKey: ["my_friens", userId],
        queryFn: getfriend,
        staleTime: 0,
        gcTime: 1000 * 3600 * 12,
        enabled: !!userId,
        refetchOnWindowFocus: false,
    })
    const friendsMap = friendStore((state) => state.friends);

    // const awaitcut = friendsMap.filter((f) => f.ask_state === "await").count()

    const finalFriends = useMemo(() => {
        if (!isSuccess) return;
        return friendList.map(g => ({
            ...g,
            ...friendsMap.get(g.id)
        })).filter((f) => f.ask_state === "agree");
    }, [friendList, friendsMap, isSuccess]);

    const setTitle = currentAppBar((state) => state.setTitle);
    const setLeftPath = currentAppBar((state) => state.setLeftPath);
    const setRightIcon = currentAppBar((state) => state.setRightIcon);
    const setRightPath = currentAppBar((state) => state.setRightPath);
    useEffect(() => {
        setLeftPath(null)
        setTitle('好友列表');
        setRightIcon(<IconCirclePlus />)
        setRightPath('/mobile/chat/friend/find/')
    }, [])

    return (
        <FriendList
            friends={finalFriends}
            onItemClick={openMsgWindow}
        // onAvatarClick={openProfile}
        />


    );

}


