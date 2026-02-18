import { Route } from "react-router-dom";
import { Chat } from "./main";
import { RsFriend } from "./friend";
import { RsDialog } from "./dialog";
import { RsSelf } from "./user";



export const RsChat = (
  <Route path="chat" element={<Chat />}>
    {RsFriend}
    {RsDialog}
    {RsSelf}
    
  </Route>
);

