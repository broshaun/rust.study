import { Route } from "react-router-dom";
import { Mian } from "./main";
import { MyList } from "./mylist";
import { Avatar } from "./avatar";
import { Nikename } from "./nickname";
import { Logout } from "./logout";


// 导出 Super 相关的路由配置
export const RsMyInfo = (
    <Route path="self" element={<Mian />}>
        <Route path="mylist" element={<MyList />}/>
        <Route path="image" element={<Avatar />}/>
        <Route path="name" element={<Nikename />}/>
         <Route path="lgout" element={<Logout />}/>
    </Route>
)
