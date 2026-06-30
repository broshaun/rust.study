import { Main,loaderData } from "./main"
import { Caller } from "./caller";
import { Receiver } from "./receiver";
import { Msg } from "./msg";
import { P2PPcmVoiceTest } from "./ui/P2PPcmVoiceTest"
import { ImagSend } from "./imgSend";
import { Smile } from "./smile";


export const RsMsgs = [
    {
        path: 'message', 
        element: <Main />,
        loader: loaderData,
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
            {
                path: "smile",
                element: <Smile />
            },
        ]
    }
];


