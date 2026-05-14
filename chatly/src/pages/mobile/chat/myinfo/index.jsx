import { Outlet, Navigate } from "react-router";
import { Items } from "./items";
import { Avatar2 } from "./avatar";
import { Nikename } from "./nickname";
import { Logout } from "./logout";
import { PushDeer } from "./pushdeer";
import { ClearLogs } from "./clear";


export const MyInfo = () => {
    return <Outlet />
}

export const RsMyInfo = [
    {
        path: "self", element: <MyInfo />,
        children: [
            {
                index: true,
                element: <Items />,
            },
            {
                path: "image",
                element: <Avatar2 />,
            },
            {
                path: "name",
                element: <Nikename />,
            },
            {
                path: "pushdeer",
                element: <PushDeer />,
            },
            {
                path: "clear",
                element: <ClearLogs />,
            },
            {
                path: "lgout",
                element: <Logout />,
            },
        ]
    }
];