import { Outlet, Navigate } from "react-router";
import { Item } from "./item";
import { Detail } from "./detail";
import { Find } from "./find";



export const Friend = () => {
    return <Outlet />
}


// 导出为对象数组
export const RsFriend = [
    {
        path: "friend", element: <Friend />,
        children: [
            {
                index: true,
                element: <Navigate to="list" replace />,
            },
            { path: "list", element: <Item /> },
            { path: "detail", element: <Detail /> },
            { path: "find", element: <Find /> },
        ]
    }


];



