import React, { useEffect, useState, useCallback, Suspense, useRef } from "react";
import { useNavigate, useLocation } from 'react-router';
import { useHttpClient2 } from 'hooks/http';
import { useWinSize } from 'hooks';
import { useRequest, useVirtualList } from 'ahooks';
import { db } from 'hooks/db';
import { liveQuery } from 'dexie';
import { Divider, Icon, YBox, XBox } from 'components/flutter';
import { Friend } from 'components/chat';


export const Item = () => {
    const navigate = useNavigate();
    const location = useLocation();
    const [friends, setFriends] = useState([]);
    const [afriend, setAfriend] = useState(0);
    const { http } = useHttpClient2('/rpc/chat/friend/')
    const { winHeight, isMobile } = useWinSize()

    const openMsgWindow = useCallback((select) => {
        navigate('/chat/mobile/detail/', { state: { select } });
    }, [navigate, location.pathname]);

    const { runAsync: runGetFriend } = useRequest(
        async () => {
            http.requestBodyJson('GET', { ask_state: 'agree' }).then((results) => {
                if (!results) return 0;
                const { code, message, data } = results;
                if (code !== 200) return 0;
                const list = data?.detail || []
                list.forEach(element => {
                    db.table('friends').get(element?.id).then((row) => {

                        if (row) {
                            db.table('friends').update(row?.id, {
                                'uid': element?.user_id,
                                'avatar_url': element?.avatar_url,
                                'email': element?.email,
                                'remark': element?.remark,
                                'nikename': element?.nikename,
                                'ask_state': element?.ask_state,
                            })
                        } else {
                            db.table('friends').put({
                                'id': element?.id,
                                'uid': element?.user_id,
                                'avatar_url': element?.avatar_url,
                                'email': element?.email,
                                'remark': element?.remark,
                                'nikename': element?.nikename,
                                'ask_state': element?.ask_state,
                                'signal': 'old',
                                'dialog': 0
                            })
                        }
                    })
                });
                return 1;
            })
        }, { manual: true }
    )

    useEffect(() => {
        runGetFriend()

        const sub = liveQuery(
            () => db.table('friends').where('ask_state').equals('agree').toArray()
        ).subscribe({
            next: rows => setFriends(rows),
            error: console.error
        })

        const sub2 = liveQuery(
            () => db.table('friends').where('ask_state').equals('await').count()
        ).subscribe({
            next: count => setAfriend(count),
            error: console.error
        })

        return () => {
            sub.unsubscribe()
            sub2.unsubscribe()
        }
    }, [])



    const containerRef = useRef(null);
    const wrapperRef = useRef(null)
    const [list] = useVirtualList(friends, {
        containerTarget: containerRef,
        wrapperTarget: wrapperRef,
        itemHeight: 74,
        overscan: 5,
    });


    return <Suspense fallback={<div>加载中...</div>}>
        <YBox ref={containerRef} scroll={true} height={winHeight-30} padding={10} >
            <YBox.Segment  align="right" >
                <Icon name='user-plus' onClick={() => { navigate('/chat/mobile/find/') }} badgeContent={afriend}/>
            </YBox.Segment>
            <Divider fade/>
            
            <div ref={wrapperRef} style={{ width: '100%', minWidth: 0 }}>
                {list.map((item) => {
                    return <Friend
                        key={item.data.id}
                        data={item.data}
                        onSelect={openMsgWindow}
                    />

                })}
            </div>
        </YBox>
    </Suspense>

}


