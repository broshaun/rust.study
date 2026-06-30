import { Outlet, useLoaderData } from "react-router";
import { Items } from "./items";
import { Avatar2 } from "./avatar";
import { Logout } from "./logout";
import { PushDeer } from "./pushdeer";
import { ClearLogs } from "./clear";
import { Nickname } from "./nickname";
import { GlobalModal } from "utils";
import { loginCache } from "cache/loginCache";
import { useState, useEffect } from "react";
import { userId, sessionId } from "utils/identity";


const loader = async () => {
    const uid = userId.get();
    const ssid = sessionId.get();
    if (!uid && !ssid) throw new Response("Unauthorized", { status: 401 });
    const initialCache = await loginCache.fetch();
    return { uid, ssid, initialCache };
};

export const MyInfo = () => {
    const { uid, ssid, initialCache } = useLoaderData();
    const [currentUser, setUser] = useState(initialCache)
    useEffect(() => {
        let isMounted = true;
        const unsubscribe = loginCache.subscribe((next) => {
            if (!isMounted) return;
            const isObject = next?.data && typeof next.data === 'object';
            const newData = isObject ? next.data : {};
            setUser(newData);
        });
        return () => {
            isMounted = false;
            unsubscribe?.();
        }
    }, [ssid]);

    return <div>
        <GlobalModal />
        <Outlet context={{ currentUser, uid }} />
    </div>
}

export const RsMyInfo = [
    {
        path: "self", element: <MyInfo />,
        loader: loader,
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