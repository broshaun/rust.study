import { User } from "./main";
import { LogOn } from "./login2";
import { Register } from "./register2";
import { Settings } from "./settings";
import { Agent } from "./settings/agent";
import { MyList } from "./settings/setist";


export const RsUser = [
  {
    path: "user",
    element: <User />,
    children: [
      { path: "login", element: <LogOn />, },
      { path: "register", element: <Register />, },
      {
        path: "settings", element: <Settings />,
        children: [
          { path: "agent", element: <Agent />, },
          { path: "setlist", element: <MyList />, },
        ],
      },
    ],
  },
];