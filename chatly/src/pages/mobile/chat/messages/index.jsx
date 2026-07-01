import { Main,loaderData } from "./main"
import { Caller } from "./caller";
import { Receiver } from "./receiver";
import { Msg } from "./msg";
import { P2PPcmVoiceTest } from "./ui/P2PPcmVoiceTest"
import { ImagSend } from "./imgSend";
import { Smile } from "./smile";


export const RsMsgs = [
    {
        path: 'message/:id', 
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
                path: "caller/:id",
                element: <Caller />
            },
            {
                path: "receiver/:id",
                element: <Receiver />
            },
            {
                path: "imgUp/:id",
                element: <ImagSend />
            },
            {
                path: "smile/:id",
                element: <Smile />
            },
        ]
    }
];


