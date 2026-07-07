import React, { useState, useEffect } from "react";
import { createHttpClient, currentAppBar } from "utils";
import { FriendSearch } from "./ui/FriendSearch";
import { friend_await_message } from "cache/friend_await_message";
import { useRequest } from "ahooks";


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
        setRightIcon(null)
        setRightPath(null)
    }, []);


    const { data: findByUser, loading: isSearching, runAsync } = useRequest(
        async ({ email }) => {
            if (!email?.trim()) return null;
            const result = await http.requestBodyJson("find", { email });
            const data = result?.data ?? null;
            return data;
        },
        {
            manual: true,
            onError: console.error
        })


    const handleEmailChange = (value) => {
        setKeywordEmail(value);
    };

    const handleSearch = (email) => {
        runAsync({ email });
    };

    const handleAddFriend = async (userId) => {
        console.log('userId++', userId)
        if (!userId) return null;
        await http.requestBodyJson("PUT", { user_id: userId });
        await friend_await_message.refresh()
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