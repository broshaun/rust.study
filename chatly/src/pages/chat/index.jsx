import { Route } from "react-router-dom";
import { Chat } from "./main";
import { RsFriend } from "./friend";
import { RsDialog } from "./dialog";
import { RsMyInfo } from "./myinfo";
import { Msg } from "./dialog/msg";
import { useHttpClient2 } from 'hooks/http';
import { useRequest } from 'ahooks';
import { db } from 'hooks/db';
import { Outlet } from "react-router-dom";

export const RsChat = (
  <Route element={<Listen />}>
    <Route path="chat" element={<Chat />}>
      {RsFriend}
      {RsDialog}
      {RsMyInfo}
    </Route>
    <Route path="message" element={<Msg />} />
  </Route>
);


function Listen() {
  const { http: httpMsg } = useHttpClient2('/rpc/chat/msg/single/');
  useRequest(() => {
    httpMsg.post('POST').then((results) => {
      if (!results) return;
      const { code, data } = results;
      if (data && code === 200) {
        db.table('message').put({ 'uid': data?.uid, 'msg': data?.msg, 'timestamp': data?.timestamp, 'signal': 'receive' });
        db.table('friends').where('uid').equals(data?.uid).modify((user) => {
          user.signal = 'news';
          user.dialog = 1;
          user.timestamp = data?.timestamp
        });
      }
    });
    return 'ok';
  }, { pollingInterval: 2000, pollingWhenHidden: false });

  return <div><Outlet /></div>
}