import { EmojiList } from "./ui/EmojiList";
import { currentAppBar } from 'utils';
import { useNavigate, useOutletContext, useParams } from 'react-router';
import { useState, useEffect } from "react";


export function Smile() {
    const { id: groupId } = useParams();
    const { msgSend } = useOutletContext();
    const setLeftPath = currentAppBar((state) => state.setLeftPath);
    useEffect(() => {
        setLeftPath(`/mobile/chat/group/msgs/${groupId}`)
    }, [])

    const navigate = useNavigate();
    const sendSmile = async (text) => {
        await msgSend({ group_id: groupId, msgType: 'text', msgText: text });
        navigate(`/mobile/chat/group/msgs/${groupId}`);
    }

    return <div>
        <EmojiList
            onSelect={(emoji) => sendSmile(emoji)}
        />
    </div>
}