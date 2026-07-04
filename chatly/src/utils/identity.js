import { ObjectId } from "bson";


export const userId = {
    get() {
        let uid = localStorage.getItem('userId');
        if (!uid) throw new Error("[identity] userId missing");
        return uid;
    },
    set(id) {
        if (id) localStorage.setItem('userId', id);
    },
};

export const sessionId = {
    get() {
        let sid = sessionStorage.getItem('sessionId')
        if (!sid) {
            sid = new ObjectId().toString();
            sessionStorage.setItem('sessionId', sid)
        }
        return sid;
    },
    new() {
        let sid = new ObjectId().toString();
        sessionStorage.setItem('sessionId', sid);
        return sid;
    },
};

export const deviceId = {
    get() {
        let did = sessionStorage.getItem('deviceId')
        if (!did) {
            did = (crypto.randomUUID?.() || Math.random().toString(36).slice(2)) + Date.now();
            sessionStorage.setItem('deviceId', did)
        }
        return did;
    },
};
