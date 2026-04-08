import { ScrollArea, Box, ActionIcon, Text } from "@mantine/core";
import { IconChevronLeft, IconPhone } from '@tabler/icons-react';
import { MsgItem, ChatMsg } from 'components/chat';
import { useNavigate, Outlet, useOutlet, useOutletContext } from 'react-router';
import { ImageUpload } from "components/flutter";
import { IconPhoto } from '@tabler/icons-react';
import React, { useState, useEffect, useRef, useMemo, useCallback } from "react"


export function Tools() {
    const navigate = useNavigate();
    const { setSendText, uploadRef } = useOutletContext();



    return <div>

        <ImageUpload ref={uploadRef} size={32} >
            <ActionIcon variant="subtle" color="gray" title="发送图片">
                <IconPhoto />
            </ActionIcon>
        </ImageUpload>

        <ActionIcon variant="subtle" color="gray" title="发起通话" onClick={() => { navigate('/chat/dialog/rtc') }}>
            <IconPhone />
        </ActionIcon>

        <ActionIcon variant="subtle" color="gray" title="发起通话" onClick={() => { navigate('/chat/dialog/phone') }}>
            <IconPhone />
        </ActionIcon>

    </div>
}