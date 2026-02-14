import { Route } from "react-router-dom";
import { Chat } from "./main";
import { Msg } from "./msg";
import { List } from "./friend";
import { Find } from "./find";
import { News } from "./news";
import { ToMsg } from "./detail";



export const RsChat = (
  <>
    <Route path="msg" element={<Msg />} />
    <Route path="tomsg" element={<ToMsg />} />
    <Route path="chat" element={<Chat />}>
      <Route path="friend" element={<List />} />
      <Route path="news" element={<News />} />
      <Route path="find" element={<Find />} />

    </Route>
  </>

);


