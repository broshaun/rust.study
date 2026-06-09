import Dexie from 'dexie';

const dbCache = new Map();


/**
 * const db = getUserDB(userId)
 */
export const getUserDB = (userId) => {

  if (!userId) {
    // throw new Error('userId is required');
    return null
  }
  if (dbCache.has(userId)) {
    return dbCache.get(userId);
  }
  const db = new Dexie(`chatDB_${userId}`);
  db.version(15).stores({
    message: '++id, uid, timestamp',
    friends: 'id, uid, updated_at, ask_state',
    friends_dialog: 'id, timestamp, signal',
    dialog: 'id, timestamp, signal',

    groups: 'id, updated_at, is_delete',
    groups_dialog: 'id, timestamp, signal',
    gmsgs: '++id, group_id, timestamp',
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