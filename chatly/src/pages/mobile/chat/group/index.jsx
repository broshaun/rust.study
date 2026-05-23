import { Outlet, Navigate } from "react-router";
import { Item } from "./item";
// import { Detail } from "./detail";
// import { Find } from "./find";


export const Group = () => {
    return <Outlet />
}


export const RsGroup = [
    {
        path: "group", element: <Group />,
        children: [
            {   
                index: true,
                element: <Item />
            },
            // {
            //     path: "detail",
            //     element: <Detail />
            // },
            // {
            //     path: "find",
            //     element: <Find />
            // },
        ]
    }
];



