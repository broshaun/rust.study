import { data, Navigate } from "react-router";
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
import { getUserDB, tokenStore } from "utils";
import { userId, deviceId } from "utils/identity"
import { apiMqtt } from "utils/store/apiBase";
import { create } from 'zustand'


export const useAuthStore = create((set, get) => {
    return {
        loading: false,
        data: {},
        error: null,

        initCache: async () => {
            const state = get();
            if (state.loading) return;
            try {
                set({ loading: true, error: null })
                const uid = userId.get();
                const db = getUserDB(uid);
                const did = deviceId.get();
                const host = apiMqtt.get();
                const token = tokenStore.get()?.token;
                set({ data: { uid, db, did, host, token } })
            } catch (err) {
                set({ error: err })
                throw err
            } finally {
                set({ loading: false })
            }
        }

    }
});



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

