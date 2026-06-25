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
import { RsGroup } from "./chat/group";
import { BootstrapGate } from "./BootstrapGate";


export const RsMobile = [
    {
        path: "mobile",
        children: [
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


            },
            {
                path: "chat",
                element: <BootstrapGate><ChatGuard /></BootstrapGate>,
                children: [
                    {
                        index: true,
                        element: <Navigate to="dialog" replace />,
                    },
                    {
                        element: <ChatShell />,
                        children: [
                            ...RsFriend,
                            ...RsGroup,
                            ...RsDialog,
                            ...RsMyInfo,
                            ...RsMsgs,
                            ...RsTest
                        ]
                    },

                ],
            },

        ]
    },

];

