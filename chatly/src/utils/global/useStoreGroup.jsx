import { create } from "zustand";

const isShallowEqual = (a, b) => {
  if (Object.is(a, b)) return true;
  if (!a || !b || typeof a !== "object" || typeof b !== "object") return false;

  const keysA = Object.keys(a);
  const keysB = Object.keys(b);

  if (keysA.length !== keysB.length) return false;

  return keysA.every(
    (key) =>
      Object.prototype.hasOwnProperty.call(b, key) &&
      Object.is(a[key], b[key])
  );
};

const toList = (groups, groupIds) => {
  return groupIds.map((id) => groups[id]).filter(Boolean);
};

const store = create((set, get) => ({
  groups: {},
  groupIds: [],

  syncGroups: (list = []) => {
    if (!Array.isArray(list) || !list.length) return;

    const { groups, groupIds } = get();

    const nextGroups = { ...groups };
    const nextIds = [...groupIds];
    const idSet = new Set(groupIds);

    let changed = false;

    for (const group of list) {
      if (!group?.id) continue;

      const oldGroup = groups[group.id];
      const nextGroup = oldGroup ? { ...oldGroup, ...group } : group;

      if (!oldGroup || !isShallowEqual(oldGroup, nextGroup)) {
        nextGroups[group.id] = nextGroup;
        changed = true;
      }

      if (!idSet.has(group.id)) {
        idSet.add(group.id);
        nextIds.push(group.id);
        changed = true;
      }
    }

    if (changed) {
      set({
        groups: nextGroups,
        groupIds: nextIds,
      });
    }
  },

  setGroup: (id, updates = {}) => {
    if (!id) return;

    const oldGroup = get().groups[id];
    const nextGroup = oldGroup ? { ...oldGroup, ...updates } : { id, ...updates };

    if (oldGroup && isShallowEqual(oldGroup, nextGroup)) return;

    set((state) => ({
      groups: {
        ...state.groups,
        [id]: nextGroup,
      },
      groupIds: state.groupIds.includes(id)
        ? state.groupIds
        : [...state.groupIds, id],
    }));
  },

  removeGroup: (id) => {
    if (!id || !get().groups[id]) return;

    set((state) => {
      const { [id]: _, ...nextGroups } = state.groups;

      return {
        groups: nextGroups,
        groupIds: state.groupIds.filter((gid) => gid !== id),
      };
    });
  },

  clearGroups: () => {
    set({
      groups: {},
      groupIds: [],
    });
  },
}));



/**
 * Group Store
 *
 * 数据结构:
 * groups   => { [id]: group }
 * groupIds => [id1, id2, ...]
 *
 * React:
 * const groups = groupStore.use(
 *   s => s.groupIds.map(id => s.groups[id]).filter(Boolean)
 * );
 *
 * 查询:
 * groupStore.getMap()
 * groupStore.getIds()
 * groupStore.getList()
 * groupStore.getById(id)
 *
 * 修改:
 * groupStore.sync(list)      // 批量新增/更新
 * groupStore.set(id, data)   // 单个更新
 * groupStore.remove(id)      // 删除
 * groupStore.clear()         // 清空
 *
 * 监听:
 * const unsub = groupStore.subscribe(fn)
 * unsub()
 *
 * 注意:
 * getXXX() 非响应式
 * React组件请使用 groupStore.use(...)
 */
export const groupStore = {
  use(selector) {
    return store(selector);
  },

  getMap() {
    return store.getState().groups;
  },

  getIds() {
    return store.getState().groupIds;
  },

  getList() {
    const { groups, groupIds } = store.getState();
    return toList(groups, groupIds);
  },

  getById(id) {
    if (!id) return null;
    return store.getState().groups[id] || null;
  },

  sync(list) {
    store.getState().syncGroups(list);
  },

  set(id, updates = {}) {
    store.getState().setGroup(id, updates);
  },

  remove(id) {
    store.getState().removeGroup(id);
  },

  clear() {
    store.getState().clearGroups();
  },

  subscribe(listener) {
    return store.subscribe(listener);
  },
};
