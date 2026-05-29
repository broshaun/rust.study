import { useHttpClient, currentAppBar, currentGroup, useGroupStore } from "utils";
import { useQuery } from "@tanstack/react-query";
import { useEffect } from "react";
import { Box, Text, Center, Stack } from "@mantine/core";
import { IconUsers } from "@tabler/icons-react";
import { GroupItem } from "./UI/GroupItem";
import { useNavigate } from "react-router";
import { useLocalStorage } from '@mantine/hooks';
import { IconCirclePlus } from "@tabler/icons-react";


const groups = [
    {
        id: "6a0eda8ddd4f1b65730c7953",
        group_name: "修改群名称",
        group_avatar: "群头像.jpg",
        group_notice: "群公告",
    },
];

export const Item = () => {
    const [userId] = useLocalStorage({ key: 'savedAccount' })
    const setGroup = useGroupStore((state) => state.setGroup);
    const setCurGroup = currentGroup((state) => state.setCurrent);

    const setTitle = currentAppBar((state) => state.setTitle);
    const setLeftPath = currentAppBar((state) => state.setLeftPath);
    const setRightIcon = currentAppBar((state) => state.setRightIcon);
    const setRightPath = currentAppBar((state) => state.setRightPath);

    useEffect(() => {
        setTitle('群聊')
        setLeftPath(null)
        setRightIcon(<IconCirclePlus/>)
        setRightPath('/mobile/chat/group/addg/')
    }, [])

    const { http } = useHttpClient('/rpc/chat/msg/group/')
    const { data: groups = [] } = useQuery
        ({
            queryKey: ["my_group_list", userId],
            queryFn: async () => {
                const results = await http.requestBodyJson("my_group_list");
                if (!results) throw new Error("获取失败");
                const { code, data, message } = results;
                if (code !== 200) throw new Error(message);
                return data || [];
            },
            staleTime: 1000 * 60 * 5, // 5分钟内认为缓存有效
            gcTime: 1000 * 60 * 30, // 缓存保留30分钟
            select: (data) =>
                data.map((item) => ({
                    id: item.id,
                    group_name: item.group_name,
                    group_avatar: item.group_avatar,
                    group_notice: item.group_notice,
                }))
        });

    const navigate = useNavigate();
    const onSelect = (value) => {
        setCurGroup(value)
        setGroup(value?.id, { signal: "old" })
        navigate('/mobile/chat/group/msgs')
    }

    const onAvatarClick = (value) => {
        setCurGroup(value)
        navigate('/mobile/chat/group/update')
    }

    const syncGroups = useGroupStore((state) => state.syncGroups);
    useEffect(() => {
        syncGroups(groups)
    }, [groups]);

    const groupState = useGroupStore((state) => state.groups);

    if (!groupState.length) {
        return (
            <Center py="xl">
                <Stack gap={6} align="center" opacity={0.6}>
                    <IconUsers size={26} stroke={1.5} />
                    <Text size="sm" c="dimmed">
                        暂无群聊
                    </Text>
                </Stack>
            </Center>
        );
    }
    return (
        <Box>
            {groupState.map((group) => (
                <GroupItem
                    key={group.id}
                    data={group}
                    hasNews={group?.signal === "news"}
                    onSelect={onSelect}
                    onAvatarClick={onAvatarClick}
                />
            ))}
        </Box>
    );
}