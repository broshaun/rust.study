import { Outlet, Navigate } from "react-router";
import { Items } from "./items";
import { Avatar2 } from "./avatar";
import { Logout } from "./logout";
import { PushDeer } from "./pushdeer";
import { ClearLogs } from "./clear";
import { Nickname } from "./nickname";
import { GlobalModal, useReady } from "utils";
import { loginCache } from "cache/loginCache";



export const MyInfo = () => {

    const [currentUser, setUser] = useState({})
    useEffect(() => {
        let isMounted = true;
        loginCache.fetch().catch(() => { });
        const unsubscribe = loginCache.subscribe((next) => {
            if (!isMounted) return;
            const isObject = next?.data && typeof next.data === 'object';
            const newData = isObject ? next.data : {};
            setUser(newData);
        });
        return () => {
            isMounted = false;
            unsubscribe?.();
        }
    }, []);



    const { ready, data: readyData } = useReady(() => {
        const uid = userId.get();
        if (uid && currentUser) {
            return { uid, currentUser };
        }
        return null;
    }, [currentUser]);




    return <div>
        <GlobalModal />
        <Outlet context={{ ready, readyData }} />
    </div>
}

export const RsMyInfo = [
    {
        path: "self", element: <MyInfo />,
        children: [
            {
                index: true,
                element: <Items />,
            },
            {
                path: "image",
                element: <Avatar2 />,
            },
            {
                path: "name",
                element: <Nickname />,
            },
            {
                path: "pushdeer",
                element: <PushDeer />,
            },
            {
                path: "clear",
                element: <ClearLogs />,
            },
            {
                path: "lgout",
                element: <Logout />,
            },
        ]
    }
];