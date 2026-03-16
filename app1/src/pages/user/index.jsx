import { Route } from "@solidjs/router";
// import { User } from "./main";
// import { LogOn } from "./login2";
// import { Register } from "./register2";
// import { Settings } from "./settings";
// import { Agent } from "./settings/agent";
// import { MyList } from "./settings/setist";
import { Login } from "./Login";

// 导出 User 相关的路由配置
export const RsUser = (
  <Route path="/user" component={Login}/>
  // <Route path="/user" component={User}>
  //   <Route path="/login" component={LogOn} />
  //   <Route path="/register" component={Register} />
  //   <Route path="/settings" component={Settings}>
  //     <Route path="/agent" component={Agent} />
  //     <Route path="/setlist" component={MyList} />
  //   </Route>
  // </Route>
);