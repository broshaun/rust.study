import { createHashRouter, RouterProvider, Navigate } from "react-router";
import { RsMobile } from "pages/mobile";
import { useRemainSeconds } from 'utils';


const RootIndex = () => {
  const remainSeconds = useRemainSeconds();
  if (remainSeconds > 0) {
    return <Navigate to="/mobile/chat" replace />;
  }
  return <Navigate to="/mobile/auth" replace />;
};

const router = createHashRouter([
  {
    index: true,
    element: <RootIndex />
  },
  ...RsMobile
]);

const App = () => {
  return <RouterProvider router={router} />;
};

export default App;