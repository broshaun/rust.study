import { useMemo, useCallback } from 'react';
import { liveQuery } from 'dexie';

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
      if ('dialog' in obj && typeof obj.dialog === 'boolean') {
        return { ...obj, dialog: obj.dialog ? 1 : 0 };
      }
      return obj;
    };

    const addTS = (obj) => ({ ...normalize(obj), timestamp: Date.now() });

    // ✅ 内部：构建“可监听”的查询函数（支持索引/非索引）
    const buildQueryFn = (field, value) => {
      const v = normalize({ [field]: value })[field];
      if (!isKey(v)) return () => Promise.resolve([]);

      if (indexed(field)) return () => t.where(field).equals(v).toArray();

      return () => t.toArray().then(rows => rows.filter(r => r?.[field] === v));
    };

    // ✅ 新增：批量 normalize + 自动 timestamp（可关闭）
    const normalizeMany = (list = [], withTimestamp = true) => {
      const now = Date.now();
      return (Array.isArray(list) ? list : [])
        .filter(Boolean)
        .map((x) => {
          const row = normalize(x);
          return withTimestamp ? { ...row, timestamp: now } : row;
        });
    };

    return {
      put: (data) => t.put(normalize(data)),

      // ✅ 单条 replace：合并旧字段（你的原逻辑）
      replace: (data = {}) => {
        const pk = t.schema.primKey?.keyPath;
        if (!pk || data[pk] == null) return Promise.reject(new Error('replace: 缺少主键字段'));

        const id = data[pk];
        const patch = { ...normalize(data), timestamp: Date.now() };

        return t.get(id).then(old => (!old ? t.put(patch) : t.put({ ...old, ...patch })));
      },

      update: (id, patch = {}) => {
        if (!isKey(id)) return Promise.resolve(0);
        return t.update(id, addTS(patch));
      },

      clear: () => t.clear(),

      find: (filter = {}) => {
        const keys = Object.keys(filter || {});
        if (keys.length === 0) return t.toArray();

        const field = keys[0];
        return buildQueryFn(field, filter[field])();
      },

      delete: (param) => {
        if (typeof param !== 'object' || param === null) {
          if (!isKey(param)) return Promise.resolve(0);
          return t.delete(param);
        }

        const keys = Object.keys(param || {});
        if (keys.length === 0) return Promise.resolve(0);

        const field = keys[0];
        const value = normalize({ [field]: param[field] })[field];
        if (!isKey(value)) return Promise.resolve(0);

        if (indexed(field)) return t.where(field).equals(value).delete();

        return t.toArray().then(rows => {
          const ids = rows
            .filter(r => r?.[field] === value)
            .map(r => r?.[pk])
            .filter(isKey);
          return ids.length ? t.bulkDelete(ids) : 0;
        });
      },

      // ✅ ✅ 新增：最优性能批量 upsert（单事务）
      // 语义：按主键 upsert；字段以本次数据为准（不会自动合并旧字段）
      bulkPut: (list = [], options = { withTimestamp: true }) => {
        const rows = normalizeMany(list, options?.withTimestamp !== false);
        if (!rows.length) return Promise.resolve(0);
        return t.bulkPut(rows); // ✅ Dexie 单事务批量写入
      },

      // ✅ 批量“replace语义”（合并旧字段）——更重，但和 replace 完全一致
      // 注意：需要读旧数据，所以性能不如 bulkPut
      bulkReplace: async (list = [], options = { withTimestamp: true }) => {
        if (!pk) throw new Error('bulkReplace: 缺少主键字段');

        const rows = normalizeMany(list, options?.withTimestamp !== false);
        const ids = rows.map(r => r?.[pk]).filter(isKey);
        if (!ids.length) return 0;

        const olds = await t.bulkGet(ids);
        const merged = rows.map((row, i) => {
          const old = olds[i];
          return old ? { ...old, ...row } : row;
        });

        await t.bulkPut(merged);
        return merged.length;
      },

      // ✅ 业务友好别名：默认就走 bulkPut
      upsertMany: (list = [], options) => t.bulkPut(normalizeMany(list, options?.withTimestamp !== false)),

      // ✅ 链式查询 + 监听
      where: (field) => ({
        equals: (value) => {
          const queryFn = buildQueryFn(field, value);

          return {
            toArray: () => queryFn(),
            onChange: (cb, onError) => {
              const sub = liveQuery(queryFn).subscribe({
                next: (rows) => cb?.(rows || []),
                error: (err) => (onError ? onError(err) : console.error('onChange error:', err))
              });
              return () => sub.unsubscribe();
            }
          };
        }
      }),
    };
  }, [db]);

  return { dbname, schema, table };
}