import { ActionIcon } from "@mantine/core";
import { IconChevronLeft, IconPhone, IconPhoneCheck, IconPhoneOutgoing, IconFlask, IconPhoneIncoming } from '@tabler/icons-react';
import { MsgItem, ChatMsg } from 'components/chat';
import { useNavigate, Outlet, useOutlet, useOutletContext } from 'react-router';
import { ImageUpload } from "components/flutter";
import { IconPhoto } from '@tabler/icons-react';
import React, { useEffect } from "react"
import { useWinSize } from "utils";
import { currentAppBar } from "components";


export function Tools() {
    const navigate = useNavigate();
    // const { setSendText, uploadRef } = useOutletContext();

    const setLeftPath = currentAppBar((state) => state.setLeftPath);
    useEffect(() => {
        setLeftPath('/mobile/chat/message/')
    }, [])


    return <div>


        {/* <ImageUpload ref={uploadRef} size={32} >
            <ActionIcon variant="subtle" color="gray" title="发送图片">
                <IconPhoto />
            </ActionIcon>
        </ImageUpload> */}


        <ActionIcon variant="subtle" color="gray" title="发起通话" onClick={() => { navigate('/mobile/chat/message/phone') }}>
            <IconPhoneCheck />
        </ActionIcon>

        <ActionIcon variant="subtle" color="gray" title="发起通话" onClick={() => { navigate('/mobile/chat/message/test') }}>
            <IconFlask />
        </ActionIcon>

        <ActionIcon variant="subtle" color="gray" title="发起通话" onClick={() => { navigate('/mobile/chat/message/caller') }}>
            <IconPhoneOutgoing />
        </ActionIcon>


        <ActionIcon variant="subtle" color="gray" title="接收通话" onClick={() => { navigate('/mobile/chat/message/receiver') }}>
            <IconPhoneIncoming />
        </ActionIcon>
    
    </div>
}