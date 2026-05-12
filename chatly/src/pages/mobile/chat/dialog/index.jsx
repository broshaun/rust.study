import { Outlet, Navigate } from "react-router";
import { Item } from "./item";

export const Dialog = () => {
    return <Outlet />
}

export const RsDialog = [
    {
        path: "dialog", element: <Dialog />,
        children: [
            {
                index: true,
                element: <Item />
            },
        ]
    }

];