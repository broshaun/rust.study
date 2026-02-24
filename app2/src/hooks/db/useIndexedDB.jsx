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

  // ✅ 只支持 Dexie 常见 key：string/number/Date/一层数组复合键
  const isKey = (v) =>
    typeof v === 'string' ||
    (typeof v === 'number' && Number.isFinite(v)) ||
    v instanceof Date ||
    (Array.isArray(v) && v.length > 0 && v.every(x =>
      typeof x === 'string' || (typeof x === 'number' && Number.isFinite(x)) || x instanceof Date
    ));

  const table = useCallback((tableName) => {
    const warnedFields = new Set()
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

    const buildQueryFn = (field, value) => {
      const v = normalize({ [field]: value })[field];
      if (!isKey(v)) return () => Promise.resolve([]);

      if (indexed(field)) return () => t.where(field).equals(v).toArray();

      return () => t.toArray().then(rows => rows.filter(r => r?.[field] === v));
    };

    const normalizeMany = (list = [], withTimestamp = true) => {
      const arr = Array.isArray(list) ? list : [];
      if (!arr.length) return [];
      const now = Date.now();

      return arr
        .filter(Boolean)
        .map((x) => {
          const row = normalize(x);
          return withTimestamp ? { ...row, timestamp: now } : row;
        });
    };

    const bulkPut = (list = [], options = { withTimestamp: true }) => {
      const rows = normalizeMany(list, options?.withTimestamp !== false);
      if (!rows.length) return Promise.resolve(0);
      return t.bulkPut(rows);
    };

    const bulkReplace = async (list = [], options = { withTimestamp: true }) => {
      if (!pk) throw new Error('bulkReplace: 缺少主键字段');

      const withTS = options?.withTimestamp !== false;
      const rows = normalizeMany(list, withTS);
      if (!rows.length) return 0;

      const ids = rows.map(r => r?.[pk]).filter(isKey);
      if (!ids.length) return 0;

      const olds = await t.bulkGet(ids);

      // ✅ 合并旧字段 +（可选）统一 timestamp
      const now = Date.now();
      const merged = rows.map((row, i) => {
        const old = olds[i];
        const out = old ? { ...old, ...row } : row;
        return withTS ? { ...out, timestamp: now } : out;
      });

      await t.bulkPut(merged);
      return merged.length;
    };

    return {
      put: (data) => t.put(normalize(data)),

      replace: (data = {}) => {
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
      updateBy: (filter = {}, patch = {}) => {
        const keys = Object.keys(filter || {})
        if (!keys.length) return Promise.resolve(0)

        const field = keys[0]
        const value = normalize({ [field]: filter[field] })[field]
        if (!isKey(value)) return Promise.resolve(0)

        const p = addTS(patch)

        // ✅ 有索引
        if (indexed(field)) {
          return t.where(field).equals(value).modify(p)
        }

        // ❗ 无索引 → 只警告一次
        if (!warnedFields.has(field)) {
          console.warn(
            `[Dexie:updateBy] 表 "${tableName}" 字段 "${field}" 未建立索引，正在执行全表扫描。`
          )
          warnedFields.add(field)
        }

        if (!pk) return Promise.resolve(0)

        return t.toArray().then(rows => {
          const hit = rows.filter(r => r?.[field] === value)
          if (!hit.length) return 0
          const merged = hit.map(r => ({ ...r, ...p }))
          return t.bulkPut(merged).then(() => merged.length)
        })
      },

      bulkPut,
      bulkReplace,

      // ✅ 别名：复用 bulkPut，避免逻辑分叉
      upsertMany: (list = [], options) => bulkPut(list, options),

      where: (field) => ({
        equals: (value) => {
          const queryFn = buildQueryFn(field, value);
          return {
            toArray: () => queryFn(),
            onChange: (cb, onError) => {
              const sub = liveQuery(queryFn).subscribe({
                next: (rows) => cb?.(rows || []),
                error: (err) => (onError ? onError(err) : console.error('onChange error:', err)),
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