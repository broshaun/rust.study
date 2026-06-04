import { GroupEdit } from "./UI/GroupEdit";
import { currentAppBar, useHttpClient, currentGroup } from "utils";
import { useEffect, useCallback } from "react";
import { useNavigate } from "react-router";
import { useMutation, useQueryClient, useQuery } from "@tanstack/react-query";
import { useLocalStorage } from "@mantine/hooks";


export const Update = () => {
    const queryClient = useQueryClient();
    const setTitle = currentAppBar((state) => state.setTitle);
    const setLeftPath = currentAppBar((state) => state.setLeftPath);
    const setRightIcon = currentAppBar((state) => state.setRightIcon);
    const setRightPath = currentAppBar((state) => state.setRightPath);
    useEffect(() => {
        setLeftPath('/mobile/chat/group/')
        setTitle('群聊');
        setRightIcon(null)
        setRightPath(null)
    }, [])

    const navigate = useNavigate();
    const [userId] = useLocalStorage({ key: 'current_account' })


    const { http } = useHttpClient('/rpc/chat/msg/group/');

    const { http: httpFiles } = useHttpClient('/files/avatar/');
    const uploadFile = useCallback(async (file) => {
        if (!file) return;
        const results = await httpFiles.uploadFiles(file);
        if (results?.code === 200 && results?.data) {
            return results.data
        }
    }, [httpFiles]);


    const { mutateAsync: updateGroup, isPending } = useMutation({
        mutationFn: async ({ id, group_name, group_avatar, group_notice }) => {
            if (!id) return;
            const payload = { id };
            if (group_name) payload.group_name = group_name;
            if (group_avatar) payload.group_avatar = group_avatar;
            if (group_notice) payload.group_notice = group_notice;
            const results = await http.requestBodyJson('update_group', payload)
            const { code, message, data } = results;
            if (code !== 200) {
                throw new Error(message || "修改群信息失败");
            }
            return data || true;
        },
        onSuccess: (data) => {
            console.log("修改成功:", data);
            queryClient.invalidateQueries({ queryKey: ["my_group_list", userId] }).then(() => {
                navigate('/mobile/chat/group/');
            })
        },
        onError: (error) => {
            console.error("修改失败:", error);
        },
    });


    const { mutateAsync: deteteGroup } = useMutation({
        mutationFn: async ({ id }) => {
            if (!id) return;
            const payload = { id };
            const results = await http.requestBodyJson('delete_group', payload)
            const { code, message, data } = results;
            if (code !== 200) {
                throw new Error(message || "删除群失败");
            }
            return data || true;
        },
        onSuccess: (data) => {
            console.log(data);
            queryClient.invalidateQueries({ queryKey: ["my_group_list", userId] }).then(() => {
                navigate('/mobile/chat/group/');
            })
        },
        onError: (error) => {
            console.error(error);
        },
    });


    const current_group = currentGroup((state) => state.current)
    const { data:group, refetch } = useQuery
        (
            {
                queryKey: ["group_get_by_id", current_group?.id],
                queryFn: async () => {
                    const results = await http.getById(current_group?.id);
                    const { code, data, message } = results;
                    if (code !== 200) throw new Error(message);
                    return data || {};
                },
                staleTime: 1000 * 60 * 5,
                gcTime: 1000 * 60 * 30,
            }
        );


    const handleUpdateGroup = async (value) => {
        await updateGroup({
            id: value.id,
            group_name: value.group_name,
            group_avatar: value.group_avatar,
            group_notice: value.group_notice,
        });
        await refetch();
    };


    // const group = currentGroup((state) => state.current)
    console.log('group++',group)



    return <div>

        <GroupEdit
            group={group}
            loading={isPending}
            onUploadAvatar={uploadFile}
            onDelete={(value) => deteteGroup({ id: value.id })}
            onSubmit={handleUpdateGroup}
        />

    </div>
}