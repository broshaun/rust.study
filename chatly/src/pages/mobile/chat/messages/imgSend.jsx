import { useNavigate, useOutletContext,useParams } from 'react-router';
import { useState, useEffect } from "react";
import { createHttpClient, currentAppBar } from 'utils';
import { ImgUp } from './ui/ImageUpload';


export function ImagSend() {
    const { id: friendId } = useParams();
    const { fnSendMsg } = useOutletContext();
    const setLeftPath = currentAppBar((state) => state.setLeftPath);

    useEffect(() => {
        setLeftPath(`/mobile/chat/message/${friendId}`)
    }, [])

    /**
     * 上传图片服务
     * 上传缓存30天图片
     */
    const { http: httpImg30 } = createHttpClient('/files/img30/'); // 保存图片的路由路径
    const uploadImg30 = async ({ file }) => {
        const { code, message, data } = await httpImg30.uploadFiles(file);
        if (code === 200 && data) {
            return data;
        }
        return;
    }

    const [isUploadingStart, setIsUploadingStart] = useState(false);
    const navigate = useNavigate();
    const upImg = async (files) => {
        if (!files || files.length === 0) return;
        setIsUploadingStart(true);
        try {
            for (const file of files) {
                const imgFileName = await uploadImg30({ file });
                await fnSendMsg({  msgType: 'image', msgText: imgFileName });
            }
        } catch (error) {
            console.error(error);
        }
    };

    useEffect(() => {
        if (isUploadingStart) {
            navigate(`/mobile/chat/message/${friendId}`);
        }
    }, [isUploadingStart]);

    return <div style={{ padding: '20px' }}>
        <ImgUp height={48} onClick={upImg} />
    </div>

}