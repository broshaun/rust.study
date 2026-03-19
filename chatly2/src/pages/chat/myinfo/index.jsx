import { Mian } from "./main";
import { MyList } from "./mylist";
import { Avatar2 } from "./avatar";
import { Nikename } from "./nickname";
import { Logout } from "./logout";
import { PushDeer } from "./pushdeer";
import { ClearLogs } from "./clear";


export const RsMyInfo = [
    {
        path: "self",
        element: <Mian />,
        children: [
            { path: "mylist", element: <MyList />, },
            { path: "image", element: <Avatar2 />, },
            { path: "name", element: <Nikename />, },
            { path: "pushdeer", element: <PushDeer />, },
            { path: "clear", element: <ClearLogs />, },
            { path: "lgout", element: <Logout />, },
        ],
    },
];