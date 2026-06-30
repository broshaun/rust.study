import Dexie from 'dexie';

const dbCache = new Map();

export const getUserDB = (userId) => {
  if (!userId) return null;

  // 1. 如果缓存里有，先拿出来检查
  if (dbCache.has(userId)) {
    const cachedDb = dbCache.get(userId);
    
    // 🔥【核心加固】：如果这个实例曾经被别的地方 .close() 了，或者还没打开就死锁了
    // 我们必须把它从缓存中抹去，重新 new 一个，否则后续所有的读写都会报 DatabaseClosedError
    if (cachedDb && !cachedDb.isOpen() && cachedDb.hasBeenClosed?.()) {
      console.warn(`[Dexie] 检测到用户 ${userId} 的数据库已被物理关闭，正在从缓存中移除并准备重建...`);
      dbCache.delete(userId);
    } else {
      return cachedDb;
    }
  }

  // 2. 创建全新的独立隔离数据库
  const dbName = `chatDB_${userId}`;
  const db = new Dexie(dbName);
  
  db.version(18).stores({
    message: 'id, uid, timestamp',
    friends: 'id, uid, updated_at, *ask_state',
    friends_dialog: 'id, timestamp, signal',
    groups: 'id, updated_at, is_delete',
    groups_dialog: 'id, timestamp, signal',
    gmsgs: 'id, group_id, timestamp',
  });

  // 🔥【体验优化】：显式调用 open() 并捕获初次连接错误
  db.open().catch((err) => {
    console.error(`[Dexie] 数据库 ${dbName} 异步打开失败:`, err);
  });

  dbCache.set(userId, db);
  return db;
};

export const closeUserDB = (userId) => {
  const db = dbCache.get(userId);
  if (db) {
    try {
      db.close();
    } catch {}
    dbCache.delete(userId);
    console.log(`[Dexie] 已成功关闭并注销用户 ${userId} 的本地数据库`);
  }
};

export const deleteUserDB = async (userId) => {
  const dbName = `chatDB_${userId}`;
  closeUserDB(userId); // 复用上面的清理逻辑
  try {
    await Dexie.delete(dbName);
    console.log(`[Dexie] 已成功物理物理删除用户 ${userId} 的本地数据库文件`);
  } catch (err) {
    console.error(`[Dexie] 删除用户 ${userId} 数据库文件失败:`, err);
  }
};