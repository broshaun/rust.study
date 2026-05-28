import { GroupEdit } from "./UI/GroupEdit";
import { currentAppBar, useHttpClient, currentGroup } from "utils";
import { useEffect, useCallback } from "react";
import { useNavigate } from "react-router";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { modals } from '@mantine/modals';
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
    const [userId] = useLocalStorage({ key: 'savedAccount' })
    const group = currentGroup((state) => state.current)

    const { http } = useHttpClient('/rpc/chat/msg/group/');
    const { http: httpFiles } = useHttpClient('/files/avatar/');

    const uploadFile = useCallback(async (file) => {
        if (!file) return;
        const results = await httpFiles.uploadFiles(file);
        if (results?.code === 200 && results?.data) {
            return results.data
        }
    }, [httpFiles]);


    const { mutateAsync: updateGroup } = useMutation({
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
            await queryClient.invalidateQueries({queryKey: ["my_group_list", userId]});
            return data || true;
        },
        onSuccess: (data) => {
            console.log("修改成功:", data);
            navigate('/mobile/chat/group/');
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
            navigate('/mobile/chat/group/',)
        },
        onError: (error) => {
            console.error(error);
        },
    });


    const handleDeleteGroup = (groupId) => {
        modals.openConfirmModal({
            title: '解散群聊',
            children: <div style={{ fontSize: '14px' }}>你确定要解散这个群组吗？</div>,
            labels: { confirm: '确定解散', cancel: '再想想' },
            centered: true,
            onConfirm: () => {
                console.log("执行解散后端 API", groupId);
                deteteGroup({ id: groupId })

            },
        });
    };


    return <div>
        <GroupEdit
            id={group.id}
            group_name={group.group_name}
            group_avatar={group.group_avatar}
            group_notice={group.group_notice}
            onDelete={(select) => { console.log('select', select); handleDeleteGroup(select) }}
            onClick={(value) => {
                uploadFile(value?.group_avatar).then((avatar_url) => {
                    updateGroup({
                        id: value.id,
                        group_name: value.group_name,
                        group_avatar: avatar_url,
                        group_notice: value.group_notice
                    });

                })
            }}
        />
    </div>
}