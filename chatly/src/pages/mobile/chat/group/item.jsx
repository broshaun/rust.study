import { GroupList } from "./UI/GroupList"
import { useHttpClient, currentAppBar, } from "utils";
import { useQuery } from "@tanstack/react-query";
import { useEffect } from "react";
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

    const setRightIcon = currentAppBar((state) => state.setRightIcon);
    setRightIcon(<IconCirclePlus/>)

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


    return <div>
        <GroupList data={groups} />
    </div>
}