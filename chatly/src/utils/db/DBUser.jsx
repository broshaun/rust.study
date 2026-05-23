import Dexie from 'dexie';

const dbCache = new Map();

export const getUserDB = (userId) => {

  if (!userId) {
    // throw new Error('userId is required');
    return null
  }
  if (dbCache.has(userId)) {
    return dbCache.get(userId);
  }
  const db = new Dexie(`chatDB_${userId}`);
  db.version(12).stores({
    message: '++id, uid, timestamp',
    friends: 'id, uid, timestamp, dialog, signal, ask_state',
    groups: 'id',
  });
  dbCache.set(userId, db);
  return db;
};

export const closeUserDB = (userId) => {
  const db = dbCache.get(userId);
  if (db) {
    db.close();
    dbCache.delete(userId);
  }
};

export const deleteUserDB = async (userId) => {
  const dbName = `chatDB_${userId}`;
  const db = dbCache.get(userId);
  if (db) {
    db.close();
    dbCache.delete(userId);
  }
  await Dexie.delete(dbName);
};