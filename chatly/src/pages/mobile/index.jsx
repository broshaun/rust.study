import { ChatGuard } from "pages/mobile/guard";

import { Chat } from "./chat/main";
import { RsFriend, Friend } from "./chat/friend";
import { RsDialog } from "./chat/dialog";
import { RsMyInfo } from "./chat/myinfo";
import { RsMsgs } from "./chat/messages";
import { RsTest } from "./chat/test";


export const RsMobile = [
    {
        path: "mobile",
        children: [
            {
                element: <ChatGuard />,
                children: [
                    {
                        path: "chat",
                        element: <Chat />,
                        children: [
                            ...RsFriend,
                            { path: "dialog", children: RsDialog },
                            { path: "self", children: RsMyInfo },
                            { path: "message", children: RsMsgs },
                            { path: "test", children: RsTest }
                        ]
                    }
                ],
            },
            // {
            //     path: "user",
            //     element: <User />,
            //     children: [
            //         { path: "login", element: <LogOn />, },
            //         { path: "register", element: <Register />, },
            //         {
            //             path: "settings", element: <Settings />,
            //             children: [
            //                 { path: "agent", element: <Agent />, },
            //                 { path: "setlist", element: <MyList />, },
            //             ],
            //         },
            //     ],
            // },
        ],
    },

];

