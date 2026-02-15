import { Route } from "react-router-dom";
import { User } from "./main";
import { LogOn } from "./login2";

// 导出 User 相关的路由配置
export const RsUser = (
  <Route path="user" element={<User />}>
    <Route path="login" element={<LogOn />}/>

  </Route>
);


