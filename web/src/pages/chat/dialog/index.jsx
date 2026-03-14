import { Route } from "react-router-dom";
import { Mian } from "./main";
import { Msg } from "./msg";
import { Mobile } from "./mobile";
import { Item } from "./item";


export const RsDialog = (
    <>
        <Route path="dialog" element={<Mian />}>
            <Route path="msg" element={<Msg />} />
        </Route>

        <Route path="mobile" element={<Mobile />} >
            <Route path="dialog" element={<Item />} />
        </Route>

    </>
)
