import { Outlet, Navigate } from "react-router";
import { Item } from "./item";
import { Detail } from "./detail";
import { Find } from "./find";


export const Friend = () => {
    return <Outlet />
}


export const RsFriend = [
    {
        path: "friend", element: <Friend />,
        children: [
            {   
                index: true,
                element: <Item />
            },
            {
                path: "detail",
                element: <Detail />
            },
            {
                path: "find",
                element: <Find />
            },
        ]
    }
];



