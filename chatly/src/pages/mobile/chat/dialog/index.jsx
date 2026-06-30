import { Outlet, useLoaderData } from "react-router";
import { Item } from "./item";
import { userId, sessionId } from "utils/identity";
import { getUserDB } from "utils";




export const loaderData = async () => {
    const uid = userId.get();
    const ssid = sessionId.get();
    if (!uid && !ssid) throw new Response("Unauthorized", { status: 401 });
    return { uid, ssid };
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