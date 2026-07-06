import { GroupInviteMessageList } from "./ui/InviteGroupCard";
import { currentAppBar, createHttpClient } from "utils";
import { useEffect, useState } from "react";
import { IconUsersPlus } from "@tabler/icons-react";
import { group_list2 } from "cache/group_list";
import { group_invite_msg } from "cache/group_invite_msg";
import { useUnmount } from "ahooks";


// 邀请群消息
export function InviteGroup() {
    const setTitle = currentAppBar((state) => state.setTitle);
    const setLeftPath = currentAppBar((state) => state.setLeftPath);
    const setRightIcon = currentAppBar((state) => state.setRightIcon);
    const setRightPath = currentAppBar((state) => state.setRightPath);
    const data = group_invite_msg.get();
    useUnmount(() => {
        (async () => {
            await group_invite_msg.refresh()
        })()
    })

    useEffect(() => {
        setTitle('群邀请')
        setLeftPath('/mobile/chat/group/')
        setRightIcon(<IconUsersPlus />)
        setRightPath('/mobile/chat/group/addg/')
    }, [])

    const { http } = createHttpClient('/rpc/chat/group/');
    const updateGroupAskState = async ({ id, ask_state }) => {
        const results = await http.requestBodyJson("group_ask_state", { id, ask_state });
        if (results?.code === 200) {
            await group_list2.refresh()
            return results?.data;
        }
        return []
    }

   
    return <div>
        <GroupInviteMessageList data={data}
            onAccept={(value) => { updateGroupAskState({ "id": value?.id, "ask_state": "agreed" }) }}
            onReject={(value) => { updateGroupAskState({ "id": value?.id, "ask_state": "refuse" }) }}
        />
    </div>
}