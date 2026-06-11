import { EmojiList } from "./ui/EmojiList";
import { currentAppBar, currentChat} from 'utils';
import { useNavigate, useOutletContext } from 'react-router';
import { useState, useEffect } from "react";


export function Smile() {
    const { db, mutation } = useOutletContext();
    const setLeftPath = currentAppBar((state) => state.setLeftPath);
    useEffect(() => {
        setLeftPath('/mobile/chat/group/msgs/')
    }, [])

    const navigate = useNavigate();
    const sendSmile = async (text) => {
        const {id:groupId} = currentChat.getState().get('group')
        await mutation.mutateAsync({ group_id: groupId, msgType: 'text', msgText: text });
        navigate('/mobile/chat/group/msgs/');
    }

    return <div>
        <EmojiList
            onSelect={(emoji) => sendSmile(emoji)}
        />
    </div>
}