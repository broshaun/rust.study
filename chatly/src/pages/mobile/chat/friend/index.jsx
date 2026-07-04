import { Outlet, useLoaderData } from "react-router";
import { Item } from "./item";
import { Detail } from "./detail";
import { Find } from "./find";
import { FriendRequests } from "./await";
import { sessionId, userId } from "utils/identity";
import { getUserDB } from "utils";
import { friend_list } from "cache/friend_list";



export const loaderData = async () => {
    const uid = userId.get();
    const ssid = sessionId.get();
    if (!uid && !ssid) throw new Response("Unauthorized", { status: 401 });
    await friend_list.fetch()
    return { uid, ssid };
}

export const Friend = () => {
    const readyData = useLoaderData();
    const db = getUserDB(readyData?.uid);
    return <Outlet context={{ readyData, db }} />
}


export const RsFriend = [
    {
        path: "friend", 
        element: <Friend />,
        loader: loaderData,
        children: [
            {
                index: true,
                element: <Item />
            },
            {
                path: "detail/:id",
                element: <Detail />
            },
            {
                path: "find",
                element: <Find />
            },
            {
                path: "await",
                element: <FriendRequests />
            }
        ]
    }
];



