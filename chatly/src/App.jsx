import { createHashRouter, RouterProvider, Navigate } from "react-router";
import Home from "pages/home";

import { RsMobile } from "pages/mobile";
import { useWinSize, useToken } from 'utils';


// const { isMobile } = useWinSize()

const App = () => {
  const { remainSeconds } = useToken();
  const router = createHashRouter([
    {
      index: true,
      // element: remainSeconds > 0 ? <Navigate to="/chat" replace /> : <Navigate to="/user/login" replace />,
      element: <Navigate to="/mobile/auth" replace />,
    },
    {
      path: "apps",
      element: <Home />,
    },
    ...RsMobile

  ]);

  return <RouterProvider router={router} />;
};

export default App;