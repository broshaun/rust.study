import { P2PVoiceCallPage } from "components/chat";



export function VoiceCall() {

    return <div>
        <P2PVoiceCallPage
            onInit={(value) => {
                console.log("初始化", value);
            }}
            onStartCall={() => {
                console.log("发起通话");
                return {
                    "id": "ba0a8680a9c50d539eea3fee7c45196ad0d800fb40f18134f9072dea4bfae974",
                    "addrs": [
                        {
                            "Relay": "https://euc1-1.relay.n0.iroh-canary.iroh.link./"
                        },
                        {
                            "Ip": "116.147.146.168:16436"
                        },
                        {
                            "Ip": "192.168.0.109:54060"
                        },
                        {
                            "Ip": "192.168.2.1:54060"
                        }
                    ]
                }
            }}
            onEndCall={() => {
                console.log("通话结束");
            }}
        />
    </div>
}


