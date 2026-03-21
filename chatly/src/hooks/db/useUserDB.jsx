import { useMemo } from 'react';
import Dexie from 'dexie';

const dbCache = new Map();

const createUserDB = (userId) => {
  if (!userId) throw new Error('userId is required');

  if (dbCache.has(userId)) {
    return dbCache.get(userId);
  }

  const db = new Dexie(`chatDB_${userId}`);

  db.version(11).stores({
    message: '++id, uid, timestamp',
    friends: 'id, uid, timestamp, dialog, signal, ask_state',
  });

  dbCache.set(userId, db);
  return db;
};

export const useUserDB = (userId) => {
  const db = useMemo(() => {
    if (!userId) return null;
    return createUserDB(userId);
  }, [userId]);

  return {
    db,
    userId,
    isReady: !!db,
  };
};

// 👉 关闭 DB
export const closeUserDB = (userId) => {
  const db = dbCache.get(userId);
  if (db) {
    db.close();
    dbCache.delete(userId);
  }
};

// 👉 删除 DB（彻底清数据）
export const deleteUserDB = async (userId) => {
  const dbName = `chatDB_${userId}`;

  const db = dbCache.get(userId);
  if (db) {
    db.close();
    dbCache.delete(userId);
  }

  await Dexie.delete(dbName);
};