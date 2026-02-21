import { Route } from "react-router-dom";
import { Mian } from "./main";
import { Msg } from "./msg";


export const RsDialog = (
    <Route path="dialog" element={<Mian />}>
        <Route path="msg" element={<Msg />} />
    </Route>
)
