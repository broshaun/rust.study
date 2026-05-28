import { Item } from "./group_item";
import { Update } from "./group_update";
import { AddMember } from "./group_user_add";
import { DelMember } from "./group_user_remove";
import { Msg } from "./msg";
import { Group } from "./main";
import { ImagSend } from "./imgSend";
import { Smile } from "./smile";
import { GroupUsers } from "./group_users";



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
                element: <Update />
            },
            {
                path: "addg",
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
            }
        ]
    }
];



