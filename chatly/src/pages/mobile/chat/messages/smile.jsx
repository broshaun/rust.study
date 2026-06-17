import { EmojiList } from "./ui/EmojiList";
import { currentAppBar, currentChat } from 'utils';
import { useNavigate, useOutletContext } from 'react-router';
import { useState, useEffect } from "react";


export function Smile() {

    const { fnSendMsg } = useOutletContext();
    const current = currentChat(
        (state) => state.current.get("friend")
    );
    const setLeftPath = currentAppBar((state) => state.setLeftPath);
    useEffect(() => {
        setLeftPath('/mobile/chat/message/')
    }, [])

    const navigate = useNavigate();
    const sendSmile = async (text) => {
        await fnSendMsg({ uid: current?.uid, msgType: 'text', msgText: text });
        navigate('/mobile/chat/message/');
    }

    return <div>
        <EmojiList
            onSelect={(emoji) => sendSmile(emoji)}
        />
    </div>
}