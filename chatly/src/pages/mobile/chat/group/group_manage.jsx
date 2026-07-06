import { GroupEdit } from "./ui/GroupEdit";
import { currentAppBar, createHttpClient, useDateTime } from "utils";
import { useEffect, useCallback } from "react";
import { useNavigate, useOutletContext, useParams } from "react-router";
import { group_list2 } from "cache/group_list";
import { useLiveQuery } from "dexie-react-hooks";


// 群管理
export const Manage = () => {
    const { db } = useOutletContext();
    const { id: groupId } = useParams();

    const dt = useDateTime();
    const navigate = useNavigate();
    const setTitle = currentAppBar((state) => state.setTitle);
    const setLeftPath = currentAppBar((state) => state.setLeftPath);
    const setRightIcon = currentAppBar((state) => state.setRightIcon);
    const setRightPath = currentAppBar((state) => state.setRightPath);

    const group = useLiveQuery(async () => {
        if (!db) return;
        const { data: groups = [] } = await db.cache.get('my_group_list')
        return groups.find(item => item.id === groupId);
    }, [db, groupId], [])


    useEffect(() => {
        setLeftPath('/mobile/chat/group/')
        setTitle('群聊');
        setRightIcon(null)
        setRightPath(null)
    }, [])


    const { http } = createHttpClient('/rpc/chat/group/');
    const { http: httpFiles } = createHttpClient('/files/avatar/');
    const uploadFile = useCallback(async (file) => {
        if (!file) return;
        const results = await httpFiles.uploadFiles(file);
        if (results?.code === 200 && results?.data) {
            return results.data
        }
    }, [httpFiles]);

    const updateGroup = async ({ id, ...payload }) => {
        if (!id) return;
        Object.keys(payload).forEach((key) => {
            if (payload[key] === undefined) delete payload[key];
        });
        try {
            const results = await http.requestBodyJson('update_group', { id, ...payload });
            const { code, data } = results;
            if (code !== 200) return;
            await group_list2.refresh()
            await navigate('/mobile/chat/group/');
        } catch (error) {
            console.error("修改失败:", error);
        }
    };

    const deteteGroup = async ({ id }) => {
        if (!id) return;
        const payload = { id };
        const results = await http.requestBodyJson('delete_group', payload)
        const { code } = results;

        if (code === 200) {
            await group_list2.refresh()
            await navigate('/mobile/chat/group/');
        };
    }

    const handleUpdateGroup = async (value) => {
        await updateGroup({
            id: value.id,
            group_name: value.group_name,
            group_avatar: value.group_avatar,
            group_notice: value.group_notice,
            admin_invite_only: value.admin_invite_only,
        });
    };

    return <div>
        <GroupEdit
            group={group}
            onUploadAvatar={uploadFile}
            onDelete={(value) => deteteGroup({ id: value.id })}
            onSubmit={handleUpdateGroup}
        />

    </div>
}