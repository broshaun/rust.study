import { Mian } from "./main";
import { Msg } from "./msg";
import { Mobile } from "./mobile";
import { Item } from "./item";
import { MicCapturePlayer } from "./MicCapturePlayer";

export const RsDialog = [
    {
        path: "dialog", element: <Mian />,
        children: [
            { path: "msg", element: <Msg /> },
            { path: "rtc", element: <MicCapturePlayer /> }
        ],
    },
    {
        path: "mobile", element: <Mobile />,
        children: [
            { path: "dialog", element: <Item /> },
        ],
    },
];