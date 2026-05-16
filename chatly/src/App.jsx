import { createHashRouter, RouterProvider, Navigate } from "react-router";
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
    ...RsMobile

  ]);

  return <RouterProvider router={router} />;
};

export default App;