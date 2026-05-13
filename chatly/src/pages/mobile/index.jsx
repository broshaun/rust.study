import { Navigate } from "react-router";
import { ChatGuard } from "pages/mobile/guard";
import { Chat } from "./chat/main";
import { RsFriend } from "./chat/friend";
import { RsDialog } from "./chat/dialog";
import { RsMyInfo } from "./chat/myinfo";
import { RsMsgs } from "./chat/messages";
import { RsTest } from "./chat/test";

import { Auth } from "./auth/main";
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
                        element: <Chat />,
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
                element: <Auth />,
                children: [
                    {
                        index: true,
                        element: <Navigate to="user" replace />,
                    },
                    ...RsUser
                ]


            }

        ],
    },

];

