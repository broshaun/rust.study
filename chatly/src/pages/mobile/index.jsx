import { ChatGuard } from "pages/mobile/guard";

import { Chat } from "./chat/main";
import { RsFriend } from "./chat/friend";
import { RsDialog } from "./chat/dialog";
import { RsMyInfo } from "./chat/myinfo";
import { RsMsgs } from "./chat/messages";
import { RsTest } from "./chat/test";
import { RsUser } from "./user";



export const RsMobile = [
    {
        path: "mobile",
        children: [
            {
                path: "chat",
                element: <ChatGuard />,
                children: [
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
                path: "user",
                children: [
                    ...RsUser
                ]
            }


        ],
    },

];

