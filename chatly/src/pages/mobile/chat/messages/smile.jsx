import { EmojiList } from "./ui/EmojiList";
import { currentAppBar } from 'utils';
import { useNavigate, useOutletContext, useParams } from 'react-router';
import { useEffect } from "react";


export function Smile() {
    const { id: friendId } = useParams()
    const { fnSendMsg } = useOutletContext();
    const setLeftPath = currentAppBar((state) => state.setLeftPath);
    useEffect(() => {
        setLeftPath(`/mobile/chat/message/${friendId}`)
    }, [])

    const navigate = useNavigate();
    const sendSmile = async (text) => {
        await fnSendMsg({  msgType: 'text', msgText: text });
        await navigate(`/mobile/chat/message/${friendId}`);
    }

    return <div>
        <EmojiList
            onSelect={(emoji) => sendSmile(emoji)}
        />
    </div>
}