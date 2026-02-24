import { HashRouter, Routes, Route, Navigate } from "react-router-dom";
import Home2 from "pages/home";
import { RsUser } from "pages/user";
import { RsChat } from "pages/chat";
import { useLogin } from "hooks";

const App = () => {
  const { isLogged } = useLogin();
  
  return <HashRouter>
    <Routes>
      <Route index
        element={
          isLogged
            ? <Navigate to="/chat/" replace />
            : <Navigate to="/user/login/" replace />
        }/>
      <Route path="apps" element={<Home2 />} />
      {RsUser}
      {RsChat}

    </Routes>
  </HashRouter>
}

export default App;
