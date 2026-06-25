import { Outlet } from 'react-router';
import { createHttpClient, GlobalModal } from 'utils';


export const Group = () => {
    const { http } = createHttpClient('/rpc/chat/msg/group2/');
    const msgSend = async ({ group_id, msgType, msgText }) => {
        const results = await http.requestBodyJson('send', {
            group_id: group_id,
            msg_type: msgType,
            msg_text: msgText
        });
        console.log('发送结果results', results)
    }

    return <div>
        <GlobalModal />
        <Outlet context={{ msgSend }} />
    </div>


}




