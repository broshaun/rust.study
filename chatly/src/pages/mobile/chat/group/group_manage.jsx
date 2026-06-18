import { GroupEdit } from "./ui/GroupEdit";
import { currentAppBar, createHttpClient, currentChat, useDateTime, getUserDB } from "utils";
import { useEffect, useCallback, useState } from "react";
import { useNavigate } from "react-router";
import { useLocalStorage } from "@mantine/hooks";
import { agroups } from "http/groups";


export const Manage = () => {
    const dt = useDateTime();
    const navigate = useNavigate();
    const [userId] = useLocalStorage({ key: 'current_account' })
    const current = currentChat((state) => state.current);
    const db = getUserDB(userId)

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


    const { http } = createHttpClient('/rpc/chat/msg/group/');
    const { http: httpFiles } = createHttpClient('/files/avatar/');
    const uploadFile = useCallback(async (file) => {
        if (!file) return;
        const results = await httpFiles.uploadFiles(file);
        if (results?.code === 200 && results?.data) {
            return results.data
        }
    }, [httpFiles]);


    const [group, setGroup] = useState({})
    const [isPending, setIsPending] = useState(false);
    const get_group = async () => {
        const group = current.get("group");
        if (!group) return;
        setIsPending(true);
        try {
            const results = await http.getById(group?.id);
            const { code, message, data } = results;
            if (code !== 200) {
                return {}
            }
            setGroup(data)
            return data
        } catch {
            return {}
        } finally {
            setIsPending(false);
        }
    }
    useEffect(()=>{
        get_group().catch(console.error)
    },[])



    const updateGroup = async ({ id, ...payload }) => {
        if (!id) return;
        Object.keys(payload).forEach((key) => {
            if (payload[key] === undefined) delete payload[key];
        });
        try {
            const results = await http.requestBodyJson('update_group', { id, ...payload });
            const { code, data } = results;
            if (code !== 200) return;
            await db.table('groups').update(id, { timestamp: dt.getDateTimeStr() });
            await agroups.refresh(userId)
            navigate('/mobile/chat/group/');
            await get_group()
            return data;
        } catch (error) {
            console.error("修改失败:", error);
        }
    };

    const deteteGroup = async ({ id }) => {
        if (!id) return;
        const payload = { id };
        const results = await http.requestBodyJson('delete_group', payload)
        const { code, message, data } = results;
        if (code === 200) {
            await agroups.refresh(userId)
            navigate('/mobile/chat/group/');
            await get_group()
            return data
        };
        return null;
    }

    console.log('group++',group)

    const handleUpdateGroup = async (value) => {
        await updateGroup({
            id: value.id,
            group_name: value.group_name,
            group_avatar: value.group_avatar,
            group_notice: value.group_notice,
            admin_invite_only: value.admin_invite_only,
        });
        await get_group()
    };


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