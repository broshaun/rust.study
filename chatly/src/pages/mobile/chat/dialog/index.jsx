import { Outlet, useLoaderData } from "react-router";
import { Item } from "./item";
import { userId } from "utils/identity";
import { getUserDB } from "utils";
import { friend_list2 } from "cache/friend_list";



export const loaderData = async () => {
    const uid = userId.get();
    await friend_list2.fetch()
    return { uid };
}

export const Dialog = () => {
    const readyData = useLoaderData();
    const db = getUserDB(readyData?.uid);
    return <Outlet context={{ readyData, db }} />
}

export const RsDialog = [
    {
        path: "dialog", 
        element: <Dialog />,
        loader: loaderData,
        children: [
            {
                index: true,
                element: <Item />
            },
        ]
    }

];