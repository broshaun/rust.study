import { Route } from "react-router-dom";
import { RsLogin } from "./login";
import { RsRegister } from "./register";
import { RsRoles } from "./roles";
import { User } from "./main";


// 导出 User 相关的路由配置
export const RsUser = (
  <Route path="user" element={<User />}>
    {RsLogin}
    {RsRegister}
    {RsRoles}

  </Route>
);


