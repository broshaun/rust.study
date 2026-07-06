import Dexie from 'dexie';

const dbCache = new Map();

export const getUserDB = (userId) => {
  if (!userId) return null;

  const dbName = String(userId);

  // 1. 检查缓存及实例可用性
  if (dbCache.has(userId)) {
    const cachedDb = dbCache.get(userId);
    if (cachedDb && !cachedDb.isOpen() && cachedDb._closed) {
      console.warn(`[Dexie] 数据库 ${dbName} 已关闭，正在重建...`);
      dbCache.delete(userId);
    } else {
      return cachedDb;
    }
  }

  // 2. 创建干净、无前缀的独立数据库
  const db = new Dexie(dbName);
  
  db.version(19).stores({
    cache: 'id, timestamp',
    // friends: 'id, uid, updated_at, *ask_state',
    friends_dialog: 'id, timestamp, signal',
    message: 'id, uid, timestamp',
    // groups: 'id, updated_at, is_delete',
    groups_dialog: 'id, timestamp, signal',
    gmsgs: 'id, group_id, timestamp',
  });

  db.open().catch((err) => {
    console.error(`[Dexie] 数据库 ${dbName} 打开失败:`, err);
  });

  dbCache.set(userId, db);
  return db;
};

export const closeUserDB = (userId) => {
  const db = dbCache.get(userId);
  if (db) {
    try { db.close(); } catch {}
    dbCache.delete(userId);
    console.log(`[Dexie] 已关闭并注销数据库: ${userId}`);
  }
};

export const deleteUserDB = async (userId) => {
  if (!userId) return;
  closeUserDB(userId); 
  try {
    await Dexie.delete(String(userId));
    console.log(`[Dexie] 已成功物理删除数据库: ${userId}`);
  } catch (err) {
    console.error(`[Dexie] 删除数据库 ${userId} 失败:`, err);
  }
};

export const clearAllUserDB = async () => {
  for (const [userId, db] of dbCache.entries()) {
    try { db.close(); } catch {}
  }
  dbCache.clear();
  try {
    const dbNames = await Dexie.getDatabaseNames();
    await Promise.all(dbNames.map(name => Dexie.delete(name)));
    console.log('[Dexie] 已成功清空本域名下的所有本地数据库');
  } catch (err) {
    console.error('[Dexie] 清空所有数据库失败:', err);
  }
};