import { Outlet, Navigate } from "react-router";
import { Login } from "./login";
import { Register } from "./register";
import { Agent } from "./agent";
import { Items } from "./items";


export const User = () => {
  return <Outlet />
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
        path: "agent",
        element: <Agent />
      },
      {
        path: "items",
        element: <Items />
      }

    ]
  }
];