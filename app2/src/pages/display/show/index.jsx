import { Route } from "react-router-dom";
import Show from "./main";
import { Add } from "./add";
import { List } from "./get";
import { Update } from "./upd";
import { Check } from "./check";
import { CardShow } from "./card";
import { Photo } from "./photo";


// 导出 Super 相关的路由配置
export const RsShow = (
    <Route path="show" element={<Show />}>
        <Route path="add" element={<Add />} />
        <Route path="get" element={<List />} />
        <Route path="card" element={<CardShow />} />
        <Route path="upd" element={<Update />} />
        <Route path="check" element={<Check />} />
        <Route path="photo" element={<Photo />} />
        
    </Route>
)
