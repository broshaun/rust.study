import { createMemoryRouter, RouterProvider, Navigate } from "react-router";
import Home2 from "pages/home";
import { RsUser } from "pages/user";
import { RsChat } from "pages/chat";
import { useToken } from "hooks";


const App = () => {
  const { remainSeconds } = useToken();

  const router = createMemoryRouter(
    [
      {
        path: "/",
        element: remainSeconds > 0 ? <Navigate to="/chat" replace /> : <Navigate to="/user/login" replace />,
      },
      {
        path: "apps",
        element: <Home2 />,
      },
      ...RsUser,
      ...RsChat,
    ]
  );
  
  return <RouterProvider router={router} />;
};

export default App;