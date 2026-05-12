import { Msg } from "./msg";
import { P2PPcmVoiceTest, Tools } from "./tools";



export const RsMsgs = [
    {
        path: "message", element: <Msg />,
        children: [
            { path: "tools", element: <Tools /> },
        ]
    },
    { path: "phone", element: <P2PPcmVoiceTest /> }

];


