import { Item } from "./group_list";
import { Manage } from "./group_manage";
import { AddMember } from "./group_user_add";
import { DelMember } from "./group_user_remove";
import { Msg } from "./msg_text_send";
import { Group } from "./group";
import { ImagSend } from "./msg_img_send";
import { Smile } from "./msg_smile_send";
import { GroupUsers } from "./group_users";
import { CreateGroup } from "./group_add";
import { InviteGroup } from "./group_invite"


export const RsGroup = [
    {
        path: "group", element: <Group />,
        children: [
            {
                index: true,
                element: <Item />
            },
            {
                path: "update",
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
                path: "msgs",
                element: <Msg />
            },
            {
                path: "imgUp",
                element: <ImagSend />
            },
            {
                path: "smile",
                element: <Smile />
            },
            {
                path: "gusr",
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



