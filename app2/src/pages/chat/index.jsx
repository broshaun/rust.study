import { Route } from "react-router-dom";
import { Chat } from "./main";
import { Msg } from "./msg";
import { List } from "./friend";



export const RsChat = (
  <>
    <Route path="msg" element={<Msg />} />
    <Route path="chat" element={<Chat />}>
      <Route path="friend" element={<List />} />

    </Route>
  </>

);


