import { Route } from "react-router-dom";
import { Mian } from "./main";
import { Detail } from "./detail";
import { Find } from "./find";

import { Item } from "./item";
import { Mobile } from "./mobile";


export const RsFriend = (
    <>
        <Route path="friend" element={<Mian />}>
            <Route path="detail" element={<Detail />} />
            <Route path="find" element={<Find />} />
        </Route>
        
        <Route path="mobile" element={<Mobile />}> 
            <Route path="friend" element={< Item />} />
            <Route path="detail" element={<Detail />} />
            <Route path="find" element={<Find />} />
        </Route>
    </>
)
