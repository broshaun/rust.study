import { Route } from "react-router-dom";
import { Chat } from "./main";
import { RsFriend } from "./friend";
import { RsDialog } from "./dialog";
import { RsMyInfo } from "./myinfo";



export const RsChat = (
  <Route path="chat" element={<Chat />}>
    {RsFriend}
    {RsDialog}
    {RsMyInfo}
    
  </Route>
);

