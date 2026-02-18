import { Route } from "react-router-dom";
import { Mian } from "./main";
import { ImageShow } from "./imegs";





// 导出 Super 相关的路由配置
export const RsSelf = (
    <Route path="self" element={<Mian />}>
        <Route path="image" element={<ImageShow />}/>
    </Route>
)
