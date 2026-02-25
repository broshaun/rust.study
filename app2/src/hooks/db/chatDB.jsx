import Dexie from 'dexie';

export const db = new Dexie('chatDB');

// 定义表结构
db.version(8).stores({
  message: '++id, uid, timestamp',
  friends: 'id, uid, timestamp, dialog, signal',
});



export const clearAllTables = async () => {
  await db.transaction('rw', db.tables, async () => {
    await Promise.all(
      db.tables.map(table => table.clear())
    );
  });
};