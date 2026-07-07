import { useNavigate, useOutletContext, useParams } from 'react-router';
import { useEffect } from "react";
import { createHttpClient, currentAppBar } from 'utils';
import { ImgUp } from './ui/ImageUpload';
import { useRequest } from 'ahooks';

export function ImagSend() {
    const { id: groupId } = useParams();
    const navigate = useNavigate();
    const { msgSend } = useOutletContext();
    const setLeftPath = currentAppBar((state) => state.setLeftPath);
    const setRightPath = currentAppBar((state) => state.setRightPath);
    

    useEffect(() => {
        setLeftPath(`/mobile/chat/group/msgs/${groupId}`)
        setRightPath(null)
    }, [])

    /**
     * 上传图片服务
     * 上传缓存30天图片
     */
    const { http: httpImg30 } = createHttpClient('/files/img30/');
    const upImg = async (file) => {
        const { code, message, data: imgFileName } = await httpImg30.uploadFiles(file);
        if (code !== 200) throw new Error(message)
        return await msgSend({ group_id: groupId, msgType: 'image', msgText: imgFileName });

    };
    const { run } = useRequest(upImg, {
        manual: true,
        onFinally: async () => {
            await navigate(`/mobile/chat/group/msgs/${groupId}`);
        }
    })

    return <div style={{ padding: '20px' }}>
        <ImgUp height={48} onClick={run} />
    </div>

}