import { Outlet, Navigate } from "react-router";
import { Msg } from "./msg";
import { P2PPcmVoiceTest, Tools } from "./tools";


export const Msgs = () => {
    return <Outlet />
}


export const RsMsgs = [
    {
        path: 'message', element: <Msgs />,
        children: [
            { index: true, element: <Navigate to="message" replace /> },
            { path: "message", element: <Msg /> },
            { path: "tools", element: <Tools /> },
            { path: "phone", element: <P2PPcmVoiceTest /> }
        ]
    }


];


