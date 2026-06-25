import { useState } from "react";

const STORAGE_KEY = "account_map";
const readMap = () => {
    try {
        return JSON.parse(localStorage.getItem(STORAGE_KEY)) || {};
    } catch {
        return {};
    }
};
const writeMap = (map) => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(map));
};
export const useAccountStorage = () => {
    const [map, setMap] = useState(readMap());
    const setUser = ({ account, user }) => {
        if (!account) return;
        const newMap = { ...map, [account]: user };
        setMap(newMap);
        writeMap(newMap);
    };
    const getUser = (account) => {
        return map?.[account] || null;
    };
    return {
        setUser,
        getUser,
    };
};