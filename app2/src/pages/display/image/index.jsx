import { Route } from "react-router-dom";
import Image from "./main";
import { List } from "./get";
import { Add } from "./add";
import { Update } from "./upd";

export const RsImage = (
    <Route path="image" element={<Image />}>
        <Route path="get" element={<List />} />
        <Route path="add" element={<Add />} />
        <Route path="upd" element={<Update />} />
    </Route>
)
