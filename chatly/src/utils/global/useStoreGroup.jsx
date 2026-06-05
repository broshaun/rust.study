import { create } from "zustand";


const isShallowEqual = (objA, objB) => {
  if (Object.is(objA, objB)) return true;
  if (typeof objA !== "object" || !objA || typeof objB !== "object" || !objB) return false;
  const keysA = Object.keys(objA);
  const keysB = Object.keys(objB);
  if (keysA.length !== keysB.length) return false;
  return keysA.every(
    (key) => Object.prototype.hasOwnProperty.call(objB, key) && Object.is(objA[key], objB[key])
  );
};

export const useStoreGroup = create((set, get) => ({
  groups: {},    // 归一化哈希表: { [id]: GroupObject }
  groupIds: [],  // 视图顺序数组: [id1, id2, ...]
  syncGroups: (newGroups = []) => {
    if (!newGroups.length) return;
    const { groups: currentGroups, groupIds: currentIds } = get();
    const nextGroups = { ...currentGroups };
    const nextIds = [...currentIds];
    let isStateDirty = false;
    for (const newGroup of newGroups) {
      const { id } = newGroup;
      const oldGroup = currentGroups[id];
      if (!oldGroup) {
        nextGroups[id] = newGroup;
        nextIds.push(id);
        isStateDirty = true;
      } else {
        const mergedGroup = { ...oldGroup, ...newGroup };
        if (!isShallowEqual(oldGroup, mergedGroup)) {
          nextGroups[id] = mergedGroup;
          isStateDirty = true;
        }
      }
    }
    if (isStateDirty) {
      set({ groups: nextGroups, groupIds: nextIds });
    }
  },

  setGroup: (id, updates = {}) => {
    const oldGroup = get().groups[id];
    const nextGroup = oldGroup ? { ...oldGroup, ...updates } : { id, ...updates };
    if (oldGroup && isShallowEqual(oldGroup, nextGroup)) return;
    set((state) => {
      const isNewGroup = !state.groups[id];
      return {
        groups: { ...state.groups, [id]: nextGroup },
        groupIds: isNewGroup ? [...state.groupIds, id] : state.groupIds,
      };
    });
  },
}));