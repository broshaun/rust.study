import Dexie from 'dexie';

export const db = new Dexie('chatDB');

// 定义表结构
db.version(6).stores({
  messages: '++id, uid, timestamp',
  chat_dialog: 'id, uid, timestamp, dialog, signal',
});

