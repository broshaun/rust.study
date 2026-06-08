import { useNavigate, useOutletContext } from 'react-router';
import { useState, useEffect } from "react";
import { useMutation } from '@tanstack/react-query';
import { currentChat, useHttpClient, currentAppBar } from 'utils';
import { ImgUp } from './UI/ImageUpload';


export function ImagSend() {
    const { mutation } = useOutletContext();
    const setLeftPath = currentAppBar((state) => state.setLeftPath);

    useEffect(() => {
        setLeftPath('/mobile/chat/group/msgs/')
    }, [])
    /**
     * 上传图片服务
     * 上传缓存30天图片
     */
    const { http: httpImg30 } = useHttpClient('/files/img30/');
    const { mutateAsync: uploadImg30 } = useMutation(
        {
            mutationFn: async ({ file }) => {
                console.log('file:', file);
                const { code, message, data } = await httpImg30.uploadFiles(file);
                console.log('code:', code);
                console.log('message:', message);
                console.log('data:', data);

                if (code === 200 && data) {
                    return data;
                }
                return;
            },

            onError: (error) => {
                console.error(error);
            },

            onSuccess: (data) => {
                console.log(data);
            },
        }
    );

    const [isUploadingStart, setIsUploadingStart] = useState(false);
    const navigate = useNavigate();
    const upImg = async (files) => {
        if (!files || files.length === 0) return;
        const {id:groupId} = currentChat.getState().get('group')

        setIsUploadingStart(true);
        try {
            for (const file of files) {
                const imgFileName = await uploadImg30({ file });
                await mutation.mutateAsync({ group_id: groupId, msgType: 'image', msgText: imgFileName });
            }
        } catch (error) {
            console.error(error);
        }
    };

    useEffect(() => {
        if (isUploadingStart && !mutation.isPending) {
            navigate('/mobile/chat/group/msgs/');
        }
    }, [mutation.isPending]);

    return <div style={{ padding: '20px' }}>
        <ImgUp height={48} onClick={upImg} />
    </div>

}