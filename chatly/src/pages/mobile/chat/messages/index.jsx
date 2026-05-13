import { Outlet, Navigate } from "react-router";
import { Main } from "./main"
import { Caller } from "./caller";
import { Receiver } from "./receiver";
import { Msg } from "./msg";
import { Tools } from "./tools/main";
import { P2PPcmVoiceTest } from "./tools/ui/P2PPcmVoiceTest"
import { Test } from "./tools/Test";
// import { P2PCallReceiver } from "./tools/P2PCallReceiver";


export const RsMsgs = [
    {
        path: 'message', element: <Main />,
        children: [
            {
                index: true,
                element: <Navigate to="msg" replace />
            },
            {
                path: "msg",
                element: <Msg />,
                children: [
                    {
                        path: "tools",
                        element: <Tools />
                    },
                ]
            },
            {
                path: "phone",
                element: <P2PPcmVoiceTest />
            },
            {
                path: "test",
                element: <Test />
            },
            
            {
                path: "caller",
                element: <Caller />
            },
            {
                path: "receiver",
                element: <Receiver />
            }
        ]
    }
];


