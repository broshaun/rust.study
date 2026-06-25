import { createHashRouter, RouterProvider, Navigate } from "react-router";
import { RsMobile } from "pages/mobile";
import { useRemainSeconds } from 'utils';


const App = () => {
  const remainSeconds = useRemainSeconds()
  const router = createHashRouter([
    {
      index: true,
      // element: remainSeconds > 0 ? <Navigate to="/mobile/chat" replace /> : <Navigate to="/mobile/auth" replace />,
      element: <Navigate to="/mobile/auth" replace />,
    },
    ...RsMobile
  ]);
  return <RouterProvider router={router} />;
};

export default App;