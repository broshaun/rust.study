import Dexie from 'dexie';

export const db = new Dexie('chatDB');

// 定义表结构
db.version(4).stores({
  messages: 'uid, timestamp',
  chat_dialog: 'uid, timestamp, dialog, signal'
});

