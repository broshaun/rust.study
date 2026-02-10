import { Route } from "react-router-dom";
import Login from "./main";
import { LogOn } from "./logon";
import { Logout } from "./logout";
import { Password } from "./password";
import { LoginInfo } from "./info";


// 导出 Super 相关的路由配置
export const RsLogin = (
    <Route path="login" element={<Login />}>
        <Route path="logon" element={<LogOn />} />
        <Route path="password" element={<Password />} />
        <Route path="logout" element={<Logout />} />
        <Route path="info" element={<LoginInfo />} />
    </Route>
)
