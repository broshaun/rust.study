import { Outlet, Navigate } from "react-router";
import { Main } from "./main"
import { Caller } from "./caller";
import { Receiver } from "./receiver";
import { Msg } from "./msg";
import { P2PPcmVoiceTest } from "./UI/P2PPcmVoiceTest"
import { ImagSend } from "./imgesend";


export const RsMsgs = [
    {
        path: 'message', element: <Main />,
        children: [
            {
                index: true,
                element: <Msg />
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
            },
            {
                path: "imgUp",
                element: <ImagSend />
            },
        ]
    }
];


