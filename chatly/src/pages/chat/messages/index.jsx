import { Msg } from "./msg";
import { P2PPcmVoiceTest, P2PVoiceCallPage, Tools } from "./tools";
import { Main } from "./main";


export const RsMsgs = [
    {
        element: <Main />,
        children: [
            {
                path: "message", element: <Msg />,
                children: [
                    { path: "tools", element: <Tools /> },
                ]
            },
            { path: "rtc", element: <P2PPcmVoiceTest /> },
            { path: "phone", element: <P2PVoiceCallPage /> }
        ]
    },
];


