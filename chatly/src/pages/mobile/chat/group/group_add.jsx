import { CreateGroupView } from "./UI/CreateGroupView"
import { currentAppBar, useHttpClient } from "utils";
import { useEffect } from "react";
import { useNavigate } from "react-router";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useLocalStorage } from "@mantine/hooks";


export function CreateGroup() {
    const setTitle = currentAppBar((state) => state.setTitle);
    const setLeftPath = currentAppBar((state) => state.setLeftPath);
    const setRightIcon = currentAppBar((state) => state.setRightIcon);
    const setRightPath = currentAppBar((state) => state.setRightPath);
    useEffect(() => {
        setTitle('创建群聊');
        setLeftPath('/mobile/chat/group/ingmsg/')
        setRightIcon(null)
        setRightPath(null)
    }, [])

    const queryClient = useQueryClient();
    const navigate = useNavigate();
    const [userId] = useLocalStorage({ key: 'current_account' })
    const { http } = useHttpClient('/rpc/chat/msg/group/')
    const { mutateAsync: createGroup } = useMutation({
        mutationFn: async ({ group_name }) => {
            const results = await http.requestBodyJson('create_group', { group_name })
            const { code, message, data } = results;
            if (code !== 200) {
                throw new Error(message || "创建群失败");
            }
            return data || true;
        },
        onSuccess: (data) => {
            queryClient.invalidateQueries({ queryKey: ["my_group_list", userId] }).then(() => {
                navigate('/mobile/chat/group/');
            })
        },
        onError: (error) => {
            console.error("创建失败:", error);
        },
    });


    return <div>
        <CreateGroupView onCreateSuccess={(group) => { createGroup({ group_name: group?.group_name }) }} />
    </div>
}