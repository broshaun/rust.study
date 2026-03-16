import { Router, Route, Navigate } from "@solidjs/router";
// import Home2 from "pages/home";
import { useToken } from "hooks/store";
import { RsUser } from "pages/user";
// import { RsChat } from "pages/chat";
import { User } from "pages/user/main";
import { Login } from "pages/user/login";
import { children } from "solid-js";


export function UserLayout(props) {

  return (
    <div>
      <div>用户模块公共头部</div>
      <div>{props.children}</div>
    </div>
  );
}



export function UserLayout2() {
  return (
    <div>用户模块公共头部2</div>
  );
}

const App = () => {
  // const { remainSeconds } = useToken();

  return (

    <Router>
      <Route path="/" component={() => <Navigate href="/user/login" />} />
      {/* <Route path="/" component={() => remainSeconds() > 0 ? (<Navigate href="/chat/" />) : (<Navigate href="/user/login/" />)} /> */}
      {/* 
      <Route path="/user" component={UserLayout} />
      <Route path="/user/login" component={() => <UserLayout><UserLayout2 /></UserLayout>} /> */}



      {/* <Route path="/user/login" component={UserLayout2} />  */}

      {/* <Route path="/apps" component={Home2} /> */}

      <RsUser />
      {/* {RsChat}  */}

    </Router>
  );
};

export default App;