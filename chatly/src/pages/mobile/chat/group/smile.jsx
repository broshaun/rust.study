import { EmojiList } from "./UI/EmojiList";
import { currentAppBar, currentGroup } from 'utils';
import { useNavigate, useOutletContext } from 'react-router';
import { useState, useEffect } from "react";


export function Smile() {
    const { db, mutation } = useOutletContext();
    const current = currentGroup((s) => s.current);
    const setLeftPath = currentAppBar((state) => state.setLeftPath);
    useEffect(() => {
        setLeftPath('/mobile/chat/group/msgs/')
    }, [])

    const navigate = useNavigate();
    const sendSmile = async (text) => {
        await mutation.mutateAsync({ group_id: current?.id, msgType: 'text', msgText: text });
        navigate('/mobile/chat/group/msgs/');
    }

    return <div>
        <EmojiList
            onSelect={(emoji) => sendSmile(emoji)}
        />
    </div>
}