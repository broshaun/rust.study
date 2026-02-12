import { HashRouter, Routes, Route } from "react-router-dom";
import Home2 from "pages/home";
import { RsUser } from "pages/user";
import { RsDisplay } from "pages/display";
import { RsChat } from "pages/chat";

const App = () => {
  return <HashRouter>
    <Routes>
      <Route path="" element={<Home2 />} />
      {RsUser}
      {RsDisplay}
      {RsChat}

    </Routes>
  </HashRouter>
}

export default App;
