import { ActionIcon } from "@mantine/core";
import { IconChevronLeft, IconPhone } from '@tabler/icons-react';
import { MsgItem, ChatMsg } from 'components/chat';
import { useNavigate, Outlet, useOutlet, useOutletContext } from 'react-router';
import { ImageUpload } from "components/flutter";
import { IconPhoto } from '@tabler/icons-react';
import React, { useEffect } from "react"
import { useWinSize } from "hooks";
import { useAppBar } from "components";


export function Tools() {
    const navigate = useNavigate();
    // const { setSendText, uploadRef } = useOutletContext();
    const { winHeight, isMobile } = useWinSize()

    const setLeftPath = useAppBar((state) => state.setLeftPath);
    useEffect(() => {
        setLeftPath('/chat/message/')
    }, [])


    return <div>


        {/* <ImageUpload ref={uploadRef} size={32} >
            <ActionIcon variant="subtle" color="gray" title="发送图片">
                <IconPhoto />
            </ActionIcon>
        </ImageUpload> */}

        <ActionIcon variant="subtle" color="gray" title="发起通话" onClick={() => { isMobile ? navigate('/chat/rtc') : navigate('/chat/dialog/rtc') }}>
            <IconPhone />
        </ActionIcon>

        <ActionIcon variant="subtle" color="gray" title="发起通话" onClick={() => { isMobile ? navigate('/chat/phone') : navigate('/chat/dialog/phone') }}>
            <IconPhone />
        </ActionIcon>

    </div>
}