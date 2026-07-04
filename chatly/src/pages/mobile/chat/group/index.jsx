import { Item } from "./group_list";
import { Manage } from "./group_manage";
import { AddMember } from "./group_user_add";
import { DelMember } from "./group_user_remove";
import { Msg } from "./msg_send";
import { ImagSend } from "./msg_send_img";
import { Smile } from "./msg_send_smile";
import { GroupUsers } from "./group_user";
import { CreateGroup } from "./group_add";
import { InviteGroup } from "./group_invite_msg"
import { Outlet } from 'react-router';
import { createHttpClient, GlobalModal, getUserDB } from 'utils';
import { group_list } from "cache/group_list";
import { loginCache } from "cache/loginCache";
import { useLoaderData } from "react-router";
import { userId } from "utils/identity";
import { group_invite_msg } from "cache/group_invite_msg";


// 
export const loaderData = async () => {
    const uid = userId.get();
    await group_list.fetch();
    await loginCache.fetch();
    await group_invite_msg.fetch();
    return { uid };
}

const Group = () => {
    const { uid } = useLoaderData();
    const db = getUserDB(uid);
    const { http } = createHttpClient('/rpc/chat/msg/group2/');
    const msgSend = async ({ group_id, msgType, msgText }) => {
        const results = await http.requestBodyJson('send', {
            group_id: group_id,
            msg_type: msgType,
            msg_text: msgText
        });
        console.log('发送结果results', results)
    }

    return <div>
        <GlobalModal />
        <Outlet context={{ msgSend, db }} />
    </div>


}


export const RsGroup = [
    {
        path: "group",
        element: <Group />,
        loader: loaderData,
        children: [
            {
                index: true,
                element: <Item />
            },
            {
                path: "update/:id",
                element: <Manage />
            },
            {
                path: "addgusr/:id",
                element: <AddMember />
            },
            {
                path: "delgusr/:id",
                element: <DelMember />
            },
            {
                path: "msgs/:id",
                element: <Msg />
            },
            {
                path: "imgUp/:id",
                element: <ImagSend />
            },
            {
                path: "smile/:id",
                element: <Smile />
            },
            {
                path: "gusr/:id",
                element: <GroupUsers />
            },
            {
                path: "addg",
                element: <CreateGroup />
            },
            {
                path: "ingmsg",
                element: <InviteGroup />
            },
        ]
    }
];



