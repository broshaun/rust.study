import { Route } from "react-router-dom";
import { Mian } from "./main";
import { Detail } from "./detail";
import { Find } from "./find";



// 导出 Super 相关的路由配置
export const RsFriend = (
    <Route path="friend" element={<Mian />}>
        <Route path="detail" element={<Detail />} />
        <Route path="find" element={<Find />} />

    </Route>
)
