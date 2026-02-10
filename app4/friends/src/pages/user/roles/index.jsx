import { Route } from "react-router-dom";
import Roles from "./main";
// import { Add } from "./add";
// import { Del } from "./del";
import { Get } from "./get";
import { Update } from "./upd";



// 导出 Super 相关的路由配置
export  const RsRoles = (
    <Route path="roles" element={<Roles />}>
      {/* <Route path="add" element={<Add />} /> */}
      <Route path="get" element={<Get />} />
      {/* <Route path="del" element={<Del />} /> */}
      <Route path="upd" element={<Update />} />
    </Route>
);
