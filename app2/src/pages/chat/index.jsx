import { Route } from "react-router-dom";
import { Chat } from "./main";
import { RsFriend } from "./friend";
import { RsDialog } from "./dialog";



export const RsChat = (
  <Route path="chat" element={<Chat />}>
    {RsFriend}
    {RsDialog}
  </Route>
);

