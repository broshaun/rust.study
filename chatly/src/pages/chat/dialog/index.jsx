import { Mian } from "./main";
import { Mobile } from "./mobile";
import { Item } from "./item";
import { RsMsgs } from "pages/chat/messages";



export const RsDialog = [
    {
        path: "dialog", element: <Mian />,
        children: [
            ...RsMsgs
        ],
    },
    {
        path: "mobile", element: <Mobile />,
        children: [
            { path: "dialog", element: <Item /> },
        ],
    },
];