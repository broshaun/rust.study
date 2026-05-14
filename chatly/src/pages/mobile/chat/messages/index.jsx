import { Outlet, Navigate } from "react-router";
import { Main } from "./main"
import { Caller } from "./caller";
import { Receiver } from "./receiver";
import { Msg } from "./msg";
import { Tools } from "./tools/main";
import { P2PPcmVoiceTest } from "./ui/P2PPcmVoiceTest"


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
                path: "test",
                element: <P2PPcmVoiceTest />
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


