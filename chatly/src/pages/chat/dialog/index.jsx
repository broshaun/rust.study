import { Mian } from "./main";
import { Msg } from "./msg";
import { Mobile } from "./mobile";
import { Item } from "./item";
import { WebRTCTest } from "./WebRTCTest";

export const RsDialog = [
    {
        path: "dialog", element: <Mian />,
        children: [
            { path: "msg", element: <Msg /> },
            { path: "rtc", element: <WebRTCTest /> }
        ],
    },
    {
        path: "mobile", element: <Mobile />,
        children: [
            { path: "dialog", element: <Item /> },
        ],
    },
];