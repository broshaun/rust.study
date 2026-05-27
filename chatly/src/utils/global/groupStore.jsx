import { create } from "zustand";

const isEqual = (a, b) => JSON.stringify(a) === JSON.stringify(b);

export const useGroupStore = create((set, get) => ({
  groups: [],

  syncGroups: (newGroups = []) => {
    const oldGroups = get().groups;

    const nextGroups = newGroups.map((newGroup) => {
      const oldGroup = oldGroups.find((g) => g.id === newGroup.id);
      return oldGroup ? { ...oldGroup, ...newGroup } : newGroup;
    });

    if (isEqual(oldGroups, nextGroups)) return;

    set({ groups: nextGroups });
  },

  setGroup: (id, updates = {}) => {
    const oldGroups = get().groups;
    const oldGroup = oldGroups.find((g) => g.id === id);

    const nextGroup = oldGroup
      ? { ...oldGroup, ...updates }
      : { id, ...updates };

    if (oldGroup && isEqual(oldGroup, nextGroup)) return;

    set({
      groups: oldGroup
        ? oldGroups.map((g) => (g.id === id ? nextGroup : g))
        : [...oldGroups, nextGroup],
    });
  },
}));