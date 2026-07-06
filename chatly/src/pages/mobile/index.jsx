import { Navigate } from "react-router";
import { ChatGuard, chatGuardLoader } from "./guard";
import { ChatShell } from "./chat/main";
import { RsFriend } from "./chat/friend";
import { RsDialog } from "./chat/dialog";
import { RsMyInfo } from "./chat/myinfo";
import { RsMsgs } from "./chat/messages";
import { RsTest } from "./chat/test";
import { AuthShell } from "./auth/main";
import { RsUser } from "./auth/user";
import { RsGroup } from "./chat/group";
import { userId } from "utils/identity"
import { getUserDB } from "utils";



export const chatShellLoader = async () => {
    const uid = userId.get();
    if (!uid) {
        throw new Response("Unauthorized", { status: 401 });
    }
    const db = getUserDB(uid)
    return { uid, db };
}

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
                element: <ChatGuard />,
                loader: chatGuardLoader,
                children: [
                    {
                        index: true,
                        element: <Navigate to="dialog" replace />,
                    },
                    {
                        element: <ChatShell />,
                        loader: chatShellLoader,
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

