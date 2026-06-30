import { useNavigate, useOutletContext } from 'react-router';
import { useState, useEffect } from "react";
import { currentChat, createHttpClient, currentAppBar } from 'utils';
import { ImgUp } from './ui/ImageUpload';


export function ImagSend() {
    const navigate = useNavigate();
    const { msgSend } = useOutletContext();
    const setLeftPath = currentAppBar((state) => state.setLeftPath);

    useEffect(() => {
        setLeftPath('/mobile/chat/group/msgs/')
    }, [])
    /**
     * 上传图片服务
     * 上传缓存30天图片
     */
    const { http: httpImg30 } = createHttpClient('/files/img30/');
    const uploadImg30 = async ({ file }) => {
        const { code, message, data } = await httpImg30.uploadFiles(file);
        if (code === 200 && data) {
            return data;
        }
        return;
    }

    const upImg = async (file) => {
        try {
            const { id: groupId } = currentChat.getState().get('group')
            const imgFileName = await uploadImg30({ file });
            await msgSend({ group_id: groupId, msgType: 'image', msgText: imgFileName });
            await navigate('/mobile/chat/group/msgs/');
        } catch (error) {
            console.error(error);
        }
    };



    return <div style={{ padding: '20px' }}>
        <ImgUp height={48} onClick={upImg} />
    </div>

}