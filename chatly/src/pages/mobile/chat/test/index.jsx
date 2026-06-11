import { Outlet } from "react-router";
import { P2PTest } from "./test01";
import { PcmTestPage } from "./test02";
import { AvTest } from "./test03";

export const Test = () => {
    return <Outlet />
}


export const RsTest = [
    {
        path: "test", element: <Test />,
        children: [
            {
                path: "test1", element: <P2PTest />,
            },
            {
                path: "test2", element: <PcmTestPage />,
            },
            {
                path: "test3", element: <AvTest />,
            }
        ]

    },
];