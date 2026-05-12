import { Mian } from "./main";
import { Mobile } from "./mobile";
import { RsMsgs } from "pages/desktop/chat/messages";



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
            { path: "dialog", element: <Mobile.Item /> },
        ],
    },
];