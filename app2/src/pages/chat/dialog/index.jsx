import { Route } from "react-router-dom";
import { Mian } from "./main";
import { Detail } from "./detail";
import { Msg } from "./msg";



// 导出 Super 相关的路由配置
export const RsDialog = (
    <Route path="dialog" element={<Mian />}>
        <Route path="msg" element={<Msg />} />

    </Route>
)
