
import { LogOn } from "./login/login2";
import { Register } from "./register/register2";
import { Settings } from "./settings";
import { Agent } from "./settings/agent";
import { MyList } from "./settings/setist";
import { Main } from "./main";

export const RsUser = [
  {
    path: "user", element: <Main />,
    children: [
      {
        index: true,
        element: <LogOn />,
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