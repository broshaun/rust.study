import Dexie from 'dexie';

export const db = new Dexie('chatDB');

// 定义表结构
db.version(1).stores({
  messages: '++id, uid, timestamp'
});

