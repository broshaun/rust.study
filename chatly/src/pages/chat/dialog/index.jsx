import { Mian } from "./main";
import { Msg } from "./msg";
import { Mobile } from "./mobile";
import { Item } from "./item";
import { P2PPcmVoiceTest, P2PVoiceCallPage, Tools } from "./tools";




export const RsDialog = [
    {
        path: "dialog", element: <Mian />,
        children: [
            {
                path: "msg", element: <Msg />, children: [
                    { path: "tools", element: <Tools /> },
                    { path: "rtc", element: <P2PPcmVoiceTest /> },
                    { path: "phone", element: <P2PVoiceCallPage /> }
                ]
            },
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