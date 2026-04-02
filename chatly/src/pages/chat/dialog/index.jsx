import { Mian } from "./main";
import { Msg } from "./msg";
import { Mobile } from "./mobile";
import { Item } from "./item";
import { P2PPcmVoiceTest } from "./P2PPcmVoiceTest";
import { P2PVoiceCallPage } from "./P2PVoiceCallPage";



export const RsDialog = [
    {
        path: "dialog", element: <Mian />,
        children: [
            { path: "msg", element: <Msg /> },
            { path: "rtc", element: <P2PPcmVoiceTest /> },
            { path: "phone", element: <P2PVoiceCallPage /> }
        ],
    },
    {
        path: "mobile", element: <Mobile />,
        children: [
            { path: "dialog", element: <Item /> },
        ],
    },
];