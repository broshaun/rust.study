import { Mian } from "./main";
import { Msg } from "./msg";
import { Mobile } from "./mobile";
import { Item } from "./item";
import { PcmVoicePage } from "./PcmVoicePage.jsx";
import { P2PPcmVoicePage } from "./P2PPcmVoicePage";



export const RsDialog = [
    {
        path: "dialog", element: <Mian />,
        children: [
            { path: "msg", element: <Msg /> },
            { path: "rtc", element: <P2PPcmVoicePage /> }
        ],
    },
    {
        path: "mobile", element: <Mobile />,
        children: [
            { path: "dialog", element: <Item /> },
        ],
    },
];