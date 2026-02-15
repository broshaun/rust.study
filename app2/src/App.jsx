import { HashRouter, Routes, Route } from "react-router-dom";
import Home2 from "pages/home";
import { RsUser } from "pages/user";
import { RsChat } from "pages/chat";

const App = () => {
  return <HashRouter>
    <Routes>
      <Route path="apps" element={<Home2 />} />
      {RsUser}
      {RsChat}

    </Routes>
  </HashRouter>
}

export default App;
