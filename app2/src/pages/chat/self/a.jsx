import React, { useTransition,useState,useEffect } from 'react'
import { useLocation } from "react-router-dom";
import { useDateTime, useHttpClient } from 'hooks';
import { Image } from 'components';
import { useRequest, useLocalStorageState } from 'ahooks';





export function Image() {
    const location = useLocation();
    const { dateTimeStr } = useDateTime()

    const [uid,setUid] = useState()

    useEffect(()=>{
        if(!location.state?.select) return;
        console.log('select',location.state?.select)
        setUid(location.state?.select.friend_id)
    },[location.state])
    


    const [msgs, setMsgs] = useLocalStorageState(uid, { defaultValue: [] })

    const [isPending, startTransition] = useTransition()
    const { http } = useHttpClient('/api/chat/msg/private/')

    const { runAsync: fnSend } = useRequest((msgText) => {
        http.requestBodyJson('PUT', { 'user_id': uid, 'msg': msgText })
            .then((results) => {
                if (!results) return;
                const { code, message, data } = results
                if (code === 200) {
                    setMsgs(p => [...p, { to: uid, msg: msgText, timestamp: dateTimeStr }])
                    console.log('发送成功')
                    console.log('发送成功')
                    console.log('user_id',uid)
                    console.log('message',message)
                    console.log('data',data)
                }
            })
        return 'ok'
    }, { manual: true })

    useRequest(() => {
        http.requestParams('GET').then((results) => {
                console.log('results',results)
                if (!results) return;
                const { code, data } = results
                startTransition(() => {
                    if (data && code === 200) setMsgs(p => [...p, data])
                })
            })
        return 'ok'
    }, { pollingInterval: 2000, pollingWhenHidden: false })

   

    return <React.Fragment>
        <Image src={'./favicon.png'}/>
    </React.Fragment>
}




