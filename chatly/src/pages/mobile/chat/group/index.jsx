import { Outlet, Navigate } from "react-router";
import { Item } from "./item";
import { Update } from "./update";
import { AddMember } from "./addMember";
import { Msg } from "./msg";
import { Group } from "./main";
import { ImagSend } from "./imgSend";
import { Smile } from "./smile";


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
        ]
    }
];



