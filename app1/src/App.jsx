import { Route, Navigate, MemoryRouter } from "@solidjs/router";
// import Home2 from "pages/home";
import { useToken } from "hooks/store";

// import { RsUser } from "pages/user";
// import { RsChat } from "pages/chat";

import { Login } from "pages/user/Login";


const App = () => {
  const { remainSeconds } = useToken();

  return (
    <MemoryRouter>
      {/* <Route
        path="/"
        component={() =>
          remainSeconds() > 0 ? (
            <Navigate href="/chat/" />
          ) : (
            <Navigate href="/user/login/" />
          )
        }
      /> */}

      {/* <Route path="/apps" component={Home2} /> */}
      <Route path="/" component={Login} />
      {/* {RsUser} */}
      {/* {RsChat}  */}
    </MemoryRouter>
  );
};

export default App;