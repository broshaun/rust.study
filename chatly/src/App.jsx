import { Routes, Route, Navigate, MemoryRouter } from "react-router-dom";
import Home2 from "pages/home";
import { RsUser } from "pages/user";
import { RsChat } from "pages/chat";
import { useToken } from "hooks";


const App = () => {
  const { remainSeconds } = useToken();
  return <>
    <MemoryRouter>
      <Routes>
        <Route index element={remainSeconds > 0 ? <Navigate to="/chat/" replace /> : <Navigate to="/user/login/" replace />} />
        <Route path="apps" element={<Home2 />} />

        {RsUser}
        {RsChat}

      </Routes>
    </MemoryRouter>

  </>
}

export default App;
