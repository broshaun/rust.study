import { Route } from "react-router-dom";
import { User } from "./main.test";
import { LogOn } from "./login2";
import { Register } from "./register2";
import { Settings } from "./settings";
import { Agent } from "./settings/agent";
import { MyList } from "./settings/setist";
import {  default as ExportDashboard } from "./test";


// 导出 User 相关的路由配置
export const RsUser = (
  <Route path="user" element={<User />}>
    <Route path="login" element={<LogOn />} />
    <Route path="register" element={<Register />} />
    <Route path="settings" element={<Settings />}>
      <Route path="agent" element={<Agent />} />
      <Route path="setlist" element={<MyList />} />
    </Route>

  </Route>
);


