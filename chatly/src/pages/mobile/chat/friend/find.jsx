import React, { useState, useEffect } from "react";
import { useHttpClient, currentAppBar } from 'utils';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { FriendFindUI } from "./UI/FriendFindUI";
import { useLocalStorage } from "@mantine/hooks";


export const Find = () => {
    const { http } = useHttpClient('/rpc/chat/friend/')
    const [keywordEmail, setKeywordEmail] = useState();
    const setTitle = currentAppBar((state) => state.setTitle);
    const setLeftPath = currentAppBar((state) => state.setLeftPath);
    const setRightIcon = currentAppBar((state) => state.setRightIcon);
    const setRightPath = currentAppBar((state) => state.setRightPath);

    useEffect(() => {
        setLeftPath('/mobile/chat/friend/')
        setTitle('好友查找');
        setRightIcon(null)
        setRightPath(null)
    }, [])

    const [userId] = useLocalStorage({ key: 'current_account' })
    const queryClient = useQueryClient();
    useEffect(() => {
        if (!userId) return;
        return () => {
            queryClient.invalidateQueries({queryKey: ["my_friends", userId]}).catch(console.error);
        };
    }, [userId]);


    // 查找好友
    const { data: findByUser, isPending: loading, mutateAsync: run } = useMutation(
        {
            mutationFn: async ({ email }) => {
                if (!email) return;
                const results = await http.requestBodyJson('find', { 'email': email });
                if (!results) return;
                const { code, message, data } = results;
                if (code === 200) return data;
                return data;
            },
        }
    );

    // 添加好友
    const { mutateAsync: addFriend } = useMutation(
        {
            mutationFn: async ({ user_id }) => {
                if (!user_id) return;
                const { code, message, data } = await http.requestBodyJson('PUT', { 'user_id': user_id })
                console.log(code, message, data)
                return 'ok'
            },
        }
    );

    const handleEmailChange = (value) => {
        setKeywordEmail(value);
    };

    // 好友请求列表
    const { data: askFriends = [], isPending: loading2 } = useQuery(
        {
            queryKey: ['friends-await'],
            queryFn: async () => {
                try {
                    const { code, data } = await http.requestBodyJson('get_await_friends', {});
                    if (code === 200) {
                        return data || [];
                    }
                    return [];
                } catch (error) {
                    console.error(error);
                    return [];
                }
            },
        });

    // 通过/拒绝请求
    const { mutateAsync: isPass } = useMutation(
        {
            mutationFn: async ({ id, ask_state }) => {
                if (!id || !ask_state) return;
                const { code, message, data } = await http.requestBodyJson('PATCH', {
                    id, ask_state,
                });
                console.log("code, message, data", code, message, data)
                return 'ok';
            },

        }
    );


    console.log('findByUser',findByUser) 

    return (
        <FriendFindUI
            keyword={keywordEmail}
            loading={loading}
            loadingRequest={loading2}
            searchResult={findByUser}
            requests={askFriends}
            onKeywordChange={handleEmailChange}
            onSearch={(email) => run({ email })}
            onAddFriend={(userId) =>
        
                addFriend({
                    user_id: userId,
                })
            }
            onAccept={(user) =>
                console.log('user',user)
                // isPass({
                //     id: user.id,
                //     ask_state: "agree",
                // })
            }
            onRefuse={(user) =>
                isPass({
                    id: user.id,
                    ask_state: "refuse",
                })
            }
        />
    );
};