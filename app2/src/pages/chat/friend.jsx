import React, { useEffect, useState, useRef, useTransition, useReducer, Suspense } from 'react';
import { SimpleTable, SingleRadio, InputText, Divider, Container } from 'components';
import { useOutletContext, useNavigate, useLocation } from 'react-router-dom';
import { useHttpClient } from 'hooks';
import { useRequest } from 'ahooks';
import { FriendList } from 'components/apps';


export const List = () => {
    const navigate = useNavigate();
    const [apiData, setApiData] = useState([]);
    const [isPending, startTransition] = useTransition()
    const { http } = useHttpClient('/api/chat/friend/')

    const { loading } = useRequest(
        () => {
            http.requestBodyJson('POST', { "skip": 0, "limit": 10 }).then((results) => {
                console.log('results',results)
                if (!results) return;
                const { code, message, data } = results
                code === 200 && startTransition(() => {
                    setApiData(data)
                })
            })

        }, { refreshDeps: [], }
    )
    return <Suspense fallback={<div>加载中...</div>}>
        {apiData &&
            <Container verticalScroll={true} horizontalScroll={true}>
                <FriendList friendsData={apiData?.detail} onSelectFriend={(select) => { window.open(`/#/msg/?id=${select?.friend_id}`, "_blank") }} />
            </Container>
        }
    </Suspense>
}