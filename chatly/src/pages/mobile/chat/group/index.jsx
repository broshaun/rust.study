import { Item } from "./group_list";
import { Manage } from "./group_manage";
import { AddMember } from "./group_user_add";
import { DelMember } from "./group_user_remove";
import { Msg } from "./msg_text_send";
import { ImagSend } from "./msg_img_send";
import { Smile } from "./msg_smile_send";
import { GroupUsers } from "./group_users";
import { CreateGroup } from "./group_add";
import { InviteGroup } from "./group_invite"
import { Outlet } from 'react-router';
import { createHttpClient, GlobalModal, getUserDB } from 'utils';
import { my_groups } from "cache/my_groups";
import { loginCache } from "cache/loginCache";
import { useLoaderData } from "react-router";
import { sessionId, userId } from "utils/identity";



export const loaderData = async () => {
    const uid = userId.get();
    const ssid = sessionId.get();
    if (!uid && !ssid) throw new Response("Unauthorized", { status: 401 });
    await my_groups.fetch();
    await loginCache.fetch();
    return { uid, ssid };
}

const Group = () => {
    const {uid,ssid} = useLoaderData();
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
        <Outlet context={{ msgSend,db }} />
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
                path: "addgusr",
                element: <AddMember />
            },
            {
                path: "delgusr",
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



