import { useHttpClient, currentAppBar,currentGroup } from "utils";
import { useQuery } from "@tanstack/react-query";
import { useEffect } from "react";
import { IconCirclePlus } from "@tabler/icons-react";
import { Box, Text, Center, Stack } from "@mantine/core";
import { IconUsers } from "@tabler/icons-react";
import { GroupItem } from "./UI/GroupItem";
import { useNavigate } from "react-router";



const groups = [
    {
        id: "6a0eda8ddd4f1b65730c7953",
        group_name: "修改群名称",
        group_avatar: "群头像.jpg",
        group_notice: "群公告",
    },
];

export const Item = () => {
    const  setCurGroup = currentGroup((state) => state.setCurrent);
    const setRightIcon = currentAppBar((state) => state.setRightIcon);
    setRightIcon(<IconCirclePlus />)
    const setLeftPath = currentAppBar((state) => state.setLeftPath);
    const setTitle = currentAppBar((state) => state.setTitle);
    useEffect(() => {
        setLeftPath(null)
        setTitle('群聊');
    }, [])


    const { http } = useHttpClient('/rpc/chat/msg/group/')


    const {
        data: groups = [],
        isLoading,
        isFetching,
        error,
        refetch,
    } = useQuery({
        queryKey: ["my_group_list"],
        queryFn: async () => {
            const results = await http.requestBodyJson("my_group_list");
            if (!results) throw new Error("获取失败");
            const { code, data, message } = results;
            if (code !== 200) throw new Error(message);
            return data || [];
        },
        staleTime: 1000 * 60 * 5, // 5分钟内认为缓存有效
        gcTime: 1000 * 60 * 30, // 缓存保留30分钟
    });

    const navigate = useNavigate();
    const onSelect = (value) => {
        // console.log("选中的群为", value)
        navigate('/mobile/chat/group/msgs')
    }

    const onAvatarClick = (value) => {
        // console.log("点击群组头像", value)
        navigate('/mobile/chat/group/update')
        setCurGroup(value)
    }



    console.log('groups', groups)

    if (!groups.length) {
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
            {groups.map((group) => (
                <GroupItem
                    key={group.id}
                    data={group}
                    onSelect={onSelect}
                    onAvatarClick={onAvatarClick}
                />
            ))}
        </Box>
    );
}