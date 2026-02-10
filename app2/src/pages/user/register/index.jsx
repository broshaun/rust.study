import { Route } from "react-router-dom";
import Register from "./main";
import { Add } from "./add";
import { List } from "./get";
import { Del } from "./del";
import { Update } from "./upd";



// 导出 Super 相关的路由配置
export const RsRegister = (
    <Route path="register" element={<Register />}>
        <Route path="add" element={<Add />} />
        <Route path="get" element={<List />} />
        <Route path="del" element={<Del />} />
        <Route path="upd" element={<Update />} />
    </Route>
)
