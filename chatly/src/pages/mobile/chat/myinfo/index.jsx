import { Outlet, useLoaderData } from "react-router";
import { Items } from "./items";
import { Avatar2 } from "./avatar";
import { Logout } from "./logout";
import { PushDeer } from "./pushdeer";
import { ClearLogs } from "./clear";
import { Nickname } from "./nickname";
import { GlobalModal, getUserDB } from "utils";
import { loginCache2 } from "cache/loginCache";
import { userId } from "utils/identity";
import { useLiveQuery } from "dexie-react-hooks";
import { Password } from "./password";


const loader = async () => {
    const uid = userId.get();
    const db = getUserDB(uid)
    await loginCache2.fetch();
    return { uid, db };
};

export const MyInfo = () => {
    const { uid, db } = useLoaderData();
    const currentUser = useLiveQuery(async () => {
        if (!db) return {};
        const currentUser = await db.cache.get('login-info2')
        return currentUser?.data || {}
    }, [db])

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
            {
                path: "password",
                element: <Password />,
            },
        ]
    }
];