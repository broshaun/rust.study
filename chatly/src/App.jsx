import { createHashRouter, RouterProvider, Navigate } from "react-router";
import Home from "pages/home";
import { RsUser } from "pages/desktop/user";
import { RsChat } from "pages/desktop/chat";
import { useToken } from "hooks";

import { RsMobile } from "pages/mobile";


const App = () => {
  const { remainSeconds } = useToken();

  const router = createHashRouter([
          // {
      //   path: "/",
      //   // element: remainSeconds > 0 ? <Navigate to="/chat" replace /> : <Navigate to="/user/login" replace />,
      //    element:  <Navigate to="/chat" replace />,
      // },
     {
        path: "apps",
        element: <Home />,
      },
      ...RsMobile,
      // ...RsUser,
      // ...RsChat,
      
    ]);
  
  return <RouterProvider router={router} />;
};

export default App;