import { ActionIcon } from "@mantine/core";
import { IconChevronLeft, IconPhone, IconPhoneCheck, IconPhotoUp, IconPhoneOutgoing, IconFlask, IconPhoneIncoming, IconPhoto } from '@tabler/icons-react';
import { MsgItem, ChatMsg } from 'components/chat';
import { useNavigate, Outlet, useOutlet, useOutletContext } from 'react-router';
import React, { useEffect } from "react"
import { useWinSize, currentAppBar } from "utils";
import { ImageUpload } from './UI/ImageUpload2'



export function Tools() {
    const navigate = useNavigate();
    // const { setSendText, uploadRef } = useOutletContext();

    const setLeftPath = currentAppBar((state) => state.setLeftPath);
    useEffect(() => {
        setLeftPath('/mobile/chat/message/')
    }, [])


    return <div>

        {/* 
        <ImageUpload size={32}
        // ref={uploadRef}
        >
        </ImageUpload> */}

        <ActionIcon
            variant="subtle"
            color="gray"
            title="发送图片"
            onClick={() => { navigate('/mobile/chat/message/caller') }}
        >
            <IconPhoto />
        </ActionIcon>





        <ActionIcon variant="subtle" color="gray" title="测试" onClick={() => { navigate('/mobile/chat/message/test') }}>
            <IconFlask />
        </ActionIcon>


        <ActionIcon variant="subtle" color="gray" title="上传图片" onClick={() => { navigate('/mobile/chat/message/imgUp') }}>
            <IconPhotoUp />
        </ActionIcon>


        <ActionIcon variant="subtle" color="gray" title="发起通话" onClick={() => { navigate('/mobile/chat/message/caller') }}>
            <IconPhoneOutgoing />
        </ActionIcon>

        {/* <ActionIcon variant="subtle" color="gray" title="接收通话" onClick={() => { navigate('/mobile/chat/message/receiver') }}>
            <IconPhoneIncoming />
        </ActionIcon> */}

    </div>
}