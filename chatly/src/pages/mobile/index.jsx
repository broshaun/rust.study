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
import { userId, deviceId } from "utils/identity"
import { apiMqtt } from "utils/store/apiBase";
import { tokenStore, getUserDB } from "utils";
import { group_list } from "cache/group_list";
import { loginCache,loginCache2 } from "cache/loginCache";



export const chatGuardLoader = async () => {
    const uid = userId.get();
    const did = deviceId.get();
    const host = apiMqtt.get();
    const token = tokenStore.get()?.token;
    if (!uid || !did || !host || !token) {
        return redirect("/mobile/auth/user");
    }
    await group_list.fetch();
    await loginCache.fetch();
    await loginCache2.fetch();
    
    const db = getUserDB(uid)
    return { uid, did, host, token, db };
};


export const chatShellLoader = async () => {
    const uid = userId.get();
    if (!uid) {
        throw new Response("Unauthorized", { status: 401 });
    }
    const db = getUserDB(uid)
    return { uid,db };
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

