import React, { useState, useEffect } from "react";
import { useHttpClient, currentAppBar } from "utils";
import { useMutation } from "@tanstack/react-query";
import { FriendSearch } from "./ui/FriendSearch";
import { IconUserExclamation } from "@tabler/icons-react";


export const Find = () => {
    const { http } = useHttpClient("/rpc/chat/friend/");
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

    const {
        data: findByUser,
        isPending: loading,
        mutateAsync: searchFriend,
    } = useMutation({
        mutationFn: async ({ email }) => {
            if (!email?.trim()) return null;
            const result = await http.requestBodyJson("find", { email });
            if (!result) return null;
            return result.data ?? null;
        },
    });

    const { mutateAsync: addFriend } = useMutation({
        mutationFn: async ({ user_id }) => {
            if (!user_id) return null;
            const result = await http.requestBodyJson("PUT", { user_id });
            return result;
        },
    });

    const handleEmailChange = (value) => {
        setKeywordEmail(value);
    };

    const handleSearch = (email) => {
        searchFriend({
            email,
        });
    };

    const handleAddFriend = (userId) => {
        addFriend({
            user_id: userId,
        });
    };

    return (
        <FriendSearch
            keyword={keywordEmail}
            isSearching={loading}
            foundUser={findByUser}
            onKeywordChange={handleEmailChange}
            onSearchUser={handleSearch}
            onAddFriend={handleAddFriend}
        />
    );
};