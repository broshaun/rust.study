import { Outlet, useLoaderData } from "react-router";
import { Item } from "./item";
import { Detail } from "./detail";
import { Find } from "./find";
import { FriendRequests } from "./await";
import { userId } from "utils/identity";
import { getUserDB } from "utils";
import { friend_list2 } from "cache/friend_list";



export const loaderData = async () => {
    const uid = userId.get();
    await friend_list2.fetch()
    return { uid };
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



