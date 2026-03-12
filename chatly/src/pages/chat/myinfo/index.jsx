import { Route } from "react-router-dom";
import { Mian } from "./main";
import { MyList } from "./mylist";
import { Avatar2 } from "./avatar";
import { Nikename } from "./nickname";
import { Logout } from "./logout";
import { PushDeer } from "./pushdeer";



export const RsMyInfo = (
    <Route path="self" element={<Mian />}>
        <Route path="mylist" element={<MyList />}/>
        <Route path="image" element={<Avatar2 />}/>
        <Route path="name" element={<Nikename />}/>
        <Route path="pushdeer" element={<PushDeer />}/>
         <Route path="lgout" element={<Logout />}/>
    </Route>
)
