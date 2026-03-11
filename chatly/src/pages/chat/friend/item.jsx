import React, { useEffect, useState, useCallback, Suspense, useRef } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useHttpClient2 } from 'hooks/http';
import { useWinSize } from 'hooks';
import { useRequest, useVirtualList } from 'ahooks';
import { db } from 'hooks/db';
import { liveQuery } from 'dexie';
import { Divider, Container, Right, Icon, Padding } from 'components/flutter';
import { Friend } from 'components/chat';


export const Item = () => {
    const navigate = useNavigate();
    const location = useLocation();
    const [friends, setFriends] = useState([]);
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
                                'nikename': element?.nikename
                            })
                        } else {
                            db.table('friends').put({
                                'id': element?.id,
                                'uid': element?.user_id,
                                'avatar_url': element?.avatar_url,
                                'email': element?.email,
                                'remark': element?.remark,
                                'nikename': element?.nikename,
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
            () => db.table('friends').toArray()
        ).subscribe({
            next: rows => setFriends(rows),
        })
        return () => sub.unsubscribe()
    }, [])



    const containerRef = useRef(null);
    const wrapperRef = useRef(null)
    const [list] = useVirtualList(friends, {
        containerTarget: containerRef,
        wrapperTarget: wrapperRef,
        itemHeight: 74,
        overscan: 10,
    });


    return <Suspense fallback={<div>加载中...</div>}>
        <Container verticalScroll={true} ref={containerRef} height={winHeight}>
            <Padding value={5}>
                <Right>
                    <Icon name='magnifying-glass' onClick={() => { navigate('/chat/mobile/find/') }} />
                </Right>
            </Padding>
            <Divider />
            <Padding value={5}>
                <div ref={wrapperRef}>
                    {list.map((item) => {
                        return <Friend
                            data={item.data}
                            onSelect={openMsgWindow}
                        />
                    })}
                </div>
            </Padding>
        </Container>
    </Suspense>

}


