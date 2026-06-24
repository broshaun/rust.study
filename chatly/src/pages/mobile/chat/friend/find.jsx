import React, { useState, useEffect } from "react";
import { createHttpClient, currentAppBar } from "utils";
import { FriendSearch } from "./ui/FriendSearch";
import { IconUserExclamation } from "@tabler/icons-react";
import { afriends } from "cache/friends";


export const Find = () => {
    const { http } = createHttpClient("/rpc/chat/friend/");
    const [keywordEmail, setKeywordEmail] = useState("");

    const setTitle = currentAppBar((state) => state.setTitle);
    const setLeftPath = currentAppBar((state) => state.setLeftPath);
    const setRightIcon = currentAppBar((state) => state.setRightIcon);
    const setRightPath = currentAppBar((state) => state.setRightPath);

    useEffect(() => {
        setLeftPath("/mobile/chat/friend/");
        setTitle("好友查找");
        setRightIcon(<IconUserExclamation />);
        setRightPath('/mobile/chat/friend/await/');
    }, []);


    const [isSearching, setIsSearching] = useState(false);
    const [findByUser, setFindByUser] = useState(null);
    const searchFriend = async ({ email }) => {
        if (!email?.trim()) return null;
        try {
            setIsSearching(true);
            const result = await http.requestBodyJson("find", { email });
            const data = result?.data ?? null;
            setFindByUser(data);
            return data;
        } catch (err) {
            setFindByUser(null);
            console.error(err)
        } finally {
            setIsSearching(false);
        }
    };

    const addFriend = async ({ user_id }) => {
        if (!user_id) return null;
        const result = await http.requestBodyJson("PUT", { user_id });
        return result;
    }

    const handleEmailChange = (value) => {
        setKeywordEmail(value);
    };

    const handleSearch = (email) => {
        searchFriend({
            email,
        });
    };

    const handleAddFriend = async (userId) => {
        addFriend({
            user_id: userId,
        });
        await afriends.refresh()
    };

    return (
        <FriendSearch
            keyword={keywordEmail}
            isSearching={isSearching}
            foundUser={findByUser}
            onKeywordChange={handleEmailChange}
            onSearchUser={handleSearch}
            onAddFriend={handleAddFriend}
        />
    );
};