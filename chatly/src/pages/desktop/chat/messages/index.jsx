import { Msg } from "./msg";
import { P2PPcmVoiceTest, Tools } from "./tools";
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
            { path: "phone", element: <P2PPcmVoiceTest /> }
        ]
    },
];


