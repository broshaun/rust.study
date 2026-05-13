import { Outlet, Navigate } from "react-router";
import { Login } from "./login";
import { Register } from "./register";
import { Settings } from "./settings";
import { Agent } from "./settings/agent";
import { MyList } from "./settings/setist";




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
        path: "settings",
        element: <Settings />,
        children: [
          {
            path: "agent",
            element: <Agent />
          },
          {
            path: "setlist",
            element: <MyList />
          }
        ]
      }
    ]
  }
];