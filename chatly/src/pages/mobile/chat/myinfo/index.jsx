import { Outlet, Navigate } from "react-router";
import { Items } from "./items";
import { Avatar2 } from "./avatar";
import { Logout } from "./logout";
import { PushDeer } from "./pushdeer";
import { ClearLogs } from "./clear";
import { Nickname } from "./nickname";
import { GlobalModal } from "utils";


export const MyInfo = () => {
    return <div>
        <GlobalModal />
        <Outlet />
    </div>
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
                element: <Nickname />,
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