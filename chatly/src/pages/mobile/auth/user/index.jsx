import { Outlet } from "react-router";
import { GlobalModal } from "utils";
import { Login } from "./login";
import { Register } from "./register";
import { Proxy } from "./proxy";


export const User = () => {
  return <div>
    <GlobalModal />
    <Outlet />
  </div>
}

export const RsUser = [
  {
    path: "user", element: <User />,
    children: [
      {
        index: true,
        element: <Login />,
      },
      {
        path: "register",
        element: <Register />,
      },
      {
        path: "proxy",
        element: <Proxy />,
      },
    ]
  }
];