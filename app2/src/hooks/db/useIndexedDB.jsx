import { useMemo, useCallback } from 'react';

export function useIndexedDB(db) {

  const dbname = db.name;

  const schema = useMemo(() => {
    const result = {};
    db.tables.forEach(t => {
      result[t.name] = {
        primaryKey: t.schema.primKey?.keyPath,
        indexes: t.schema.indexes.map(i => i.name)
      };
    });
    return result;
  }, [db]);

  const table = useCallback((tableName) => {
    const t = db.table(tableName);

    return {

      put: (data) => t.put(data),

      clear: () => t.clear(),

      find: (filter = {}) => {
        const keys = Object.keys(filter);
        if (keys.length === 0) return t.toArray();

        const field = keys[0];
        const value = filter[field];

        return t.where(field).equals(value).toArray();
      },

      delete: (param) => {
        if (typeof param !== 'object' || param === null) {
          return t.delete(param);
        }

        const keys = Object.keys(param);
        if (keys.length === 0) return Promise.resolve();

        const field = keys[0];
        const value = param[field];

        return t.where(field).equals(value).delete();
      }

    };

  }, [db]);

  return {
    dbname,
    schema,
    table
  };
}