import { createHashRouter, RouterProvider, Navigate } from "react-router";
import Home from "pages/home";

import { RsMobile } from "pages/mobile";
import { useWinSize, useToken } from 'hooks';


// const { isMobile } = useWinSize()

const App = () => {
  const { remainSeconds } = useToken();
  const router = createHashRouter([
    {
      path: "/",
      // element: remainSeconds > 0 ? <Navigate to="/chat" replace /> : <Navigate to="/user/login" replace />,
      element: <Navigate to="/mobile/chat" replace />,
    },
    {
      path: "apps",
      element: <Home />,
    },
    ...RsMobile,

  ]);

  return <RouterProvider router={router} />;
};

export default App;