import { HashRouter, Routes, Route } from "react-router-dom";
import Home2 from "pages/home";
import { RsUser } from "pages/user";
import { RsDisplay } from "pages/display";


const App = () => {
  return <HashRouter>
    <Routes>
      <Route path="" element={<Home2 />} />
      {RsUser}
      {RsDisplay}

    </Routes>
  </HashRouter>
}

export default App;
