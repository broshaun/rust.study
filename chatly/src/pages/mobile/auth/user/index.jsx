import { Outlet } from "react-router";
import { Login } from "./login";
import { Register } from "./register";
import { GlobalModal } from "utils";


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
    ]
  }
];