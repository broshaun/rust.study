import { GroupEdit } from "./UI/GroupEdit";
import { currentAppBar, useHttpClient, currentChat, useDateTime, getUserDB } from "utils";
import { useEffect, useCallback, useState } from "react";
import { useNavigate } from "react-router";
import { useMutation, useQueryClient, useQuery } from "@tanstack/react-query";
import { useLocalStorage } from "@mantine/hooks";
import { liveQuery } from "dexie";


export const Manage = () => {
    const dt = useDateTime();
    const navigate = useNavigate();
    const [userId] = useLocalStorage({ key: 'current_account' })
    const current = currentChat((state) => state.current);
    const db = getUserDB(userId)

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
        mutationFn: async ({ id, ...payload }) => {
            if (!id) return;
            Object.keys(payload).forEach((key) => {
                if (payload[key] === undefined) {
                    delete payload[key];
                }
            });
            const results = await http.requestBodyJson('update_group', { id, ...payload })
            const { code, message, data } = results;
            if (code !== 200)return;
            await db.table('groups').update(id, {timestamp: dt.getDateTimeStr()});
            return data;
        },
        onSuccess: () => {
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
            if (code !== 200) return;
            return data;
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

    const handleUpdateGroup = async (value) => {
        await updateGroup({
            id: value.id,
            group_name: value.group_name,
            group_avatar: value.group_avatar,
            group_notice: value.group_notice,
            admin_invite_only: value.admin_invite_only,
        });
    };


    const get_group = async () => {
        const group = current.get("group");
        if (!group) return;
        const results = await http.getById(group?.id);
        const { code, message, data } = results;
        if (code !== 200) {
            return {}
        }
        return data
    }
    const { data: group } = useQuery({
        queryKey: ["thisgroup", userId],
        queryFn: get_group,
        staleTime: 5000,
        enabled: !!userId,
    })


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