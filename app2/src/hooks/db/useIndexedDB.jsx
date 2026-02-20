import { useMemo, useCallback } from 'react';

/**
 * useIndexedDB(db) - 精简版（适配 dialog: 0/1）
 * - table(name).put(data)
 * - table(name).replace(data)  // upsert：存在则更新字段，不存在则插入（data 必须带主键）
 * - table(name).update(id, patch)
 * - table(name).find(filter)   // 单字段过滤 or 全表
 * - table(name).delete(id|filter)
 * - table(name).clear()
 */
export function useIndexedDB(db) {
  const dbname = db.name;

  const schema = useMemo(() => {
    const out = {};
    db.tables.forEach(t => {
      out[t.name] = {
        primaryKey: t.schema.primKey?.keyPath,
        indexes: t.schema.indexes.map(i => i.name),
      };
    });
    return out;
  }, [db]);

  const isKey = (v) =>
    typeof v === 'string' ||
    (typeof v === 'number' && !Number.isNaN(v)) ||
    v instanceof Date ||
    (Array.isArray(v) && v.length > 0 && v.every(isKey));

  const table = useCallback((tableName) => {
    const t = db.table(tableName);
    const pk = t.schema.primKey?.keyPath;
    const indexed = (field) => t.schema.indexes?.some(i => i.name === field);

    const normalize = (obj) => {
      if (!obj || typeof obj !== 'object') return obj;
      // ✅ 统一把 dialog true/false 转成 1/0
      if ('dialog' in obj && typeof obj.dialog === 'boolean') {
        return { ...obj, dialog: obj.dialog ? 1 : 0 };
      }
      return obj;
    };

    const addTS = (obj) => ({ ...normalize(obj), timestamp: Date.now() });

    const parseFilter = (filter = {}) => {
      const keys = Object.keys(filter || {});
      if (keys.length === 0) return null;
      const field = keys[0];
      const value = normalize({ [field]: filter[field] })[field];
      return { field, value };
    };

    return {
      put: (data) => t.put(normalize(data)),

      replace: (data = {}) => {
        const pk = t.schema.primKey?.keyPath;
        if (!pk || data[pk] == null) {
          return Promise.reject(new Error('replace: 缺少主键字段'));
        }

        const id = data[pk];
        const patch = { ...data, timestamp: Date.now() };

        return t.get(id).then(old => {
          // 不存在就直接插入
          if (!old) return t.put(patch);

          // 存在：合并（保留旧字段，新增/覆盖新字段）
          return t.put({ ...old, ...patch });
        });
      },

      // ✅ 部分更新（自动 timestamp + dialog 规范化）
      update: (id, patch = {}) => {
        if (!isKey(id)) return Promise.resolve(0);
        return t.update(id, addTS(patch));
      },

      clear: () => t.clear(),

      // ✅ 单字段查询：有索引走 where；无索引降级全表过滤
      find: (filter = {}) => {
        const f = parseFilter(filter);
        if (!f) return t.toArray();
        if (!isKey(f.value)) return Promise.resolve([]);

        if (indexed(f.field)) {
          return t.where(f.field).equals(f.value).toArray();
        }
        return t.toArray().then(rows => rows.filter(r => r?.[f.field] === f.value));
      },

      // ✅ 删除：主键 or 单字段过滤
      delete: (param) => {
        if (typeof param !== 'object' || param === null) {
          if (!isKey(param)) return Promise.resolve(0);
          return t.delete(param);
        }

        const f = parseFilter(param);
        if (!f || !isKey(f.value)) return Promise.resolve(0);

        if (indexed(f.field)) {
          return t.where(f.field).equals(f.value).delete();
        }

        // 无索引：全表扫描删（慢但稳定）
        return t.toArray().then(rows => {
          const ids = rows
            .filter(r => r?.[f.field] === f.value)
            .map(r => r?.[pk])
            .filter(isKey);
          return ids.length ? t.bulkDelete(ids) : 0;
        });
      },
    };
  }, [db]);

  return { dbname, schema, table };
}