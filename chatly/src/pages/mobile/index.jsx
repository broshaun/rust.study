import { Navigate } from "react-router";
import { ChatGuard } from "./guard";
import { ChatShell } from "./chat/main";
import { RsFriend } from "./chat/friend";
import { RsDialog } from "./chat/dialog";
import { RsMyInfo } from "./chat/myinfo";
import { RsMsgs } from "./chat/messages";
import { RsTest } from "./chat/test";
import { AuthShell } from "./auth/main";
import { RsUser } from "./auth/user";


export const RsMobile = [
    {
        path: "mobile",
        children: [
            {
                path: "chat",
                element: <ChatGuard />,
                children: [
                    {
                        index: true,
                        element: <Navigate to="dialog" replace />,
                    },
                    {
                        element: <ChatShell />,
                        children: [
                            ...RsFriend,
                            ...RsDialog,
                            ...RsMyInfo,
                            ...RsMsgs,
                            ...RsTest
                        ]
                    },

                ],
            },
            {
                path: "auth",
                element: <AuthShell />,
                children: [
                    {
                        index: true,
                        element: <Navigate to="user" replace />,
                    },
                    ...RsUser
                ]


            }
        ]
    },

];

