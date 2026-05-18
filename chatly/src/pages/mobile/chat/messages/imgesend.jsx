import { useOutletContext } from 'react-router';
import { useCallback, useRef } from "react";

import { useMutation } from '@tanstack/react-query';
import { useWinSize, currentChat, currentAppBar, useImgApiBase, useHttpClient } from 'utils';
import { ImgUp } from './UI/ImageUpload';

export function ImagSend() {
    const { fnSendMsg, db } = useOutletContext();
    const current = currentChat((s) => s.current);

    const { joinPath: joinPathImg30 } = useImgApiBase('/files/img30/'); // 获取真实图片URL
    /**
     * 上传图片服务
     * 上传缓存30天图片
     */
    const { http: httpImg30 } = useHttpClient('/files/img30/'); // 保存图片路径
    const { mutateAsync: uploadImg30, isPending } = useMutation(
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

    const uploadRef = useRef(null);
    const fna = async () => {
        if (uploadRef.current?.file) {
            console.log('发送图片1。。。', uploadRef.current?.file)
            const imgFile = await uploadImg30({ "file": uploadRef.current.file })
            console.log('发送图片2。。。', joinPathImg30(imgFile))

            await fnSendMsg({ uid: current?.uid, msgType: 'image', msgText: imgFile })
        }
    }

    return <div>
        {/* <ImageUpload ref={uploadRef} size={32} onConfirm={fna}>
        </ImageUpload> */}
        <ImgUp ref={uploadRef} size={32} onConfirm={fna} />
    </div>

}