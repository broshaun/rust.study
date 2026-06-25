import { ObjectId } from "bson";


export const userId = {
    get() {
        const uid = localStorage.getItem('userId');
        if (!uid) throw new Error("[identity] userId missing");
        return uid;
    },
    set(id) {
        if (id) localStorage.setItem('userId', id);
    },
};

export const Tenant = {
    get() {
        const id = localStorage.getItem('tenant');
        if (!id) throw new Error("[identity] tenantId missing");
        return id;
    },
    set(id) {
        if (id) localStorage.setItem('tenant', id);
    },
};

export const sessionId = {
    get() {
        const sid = sessionStorage.getItem('sessionId')
        if (!sid) {
            sessionStorage.setItem('sessionId', new ObjectId().toString())
        }
        return sid;
    },
    new() {
        sessionStorage.setItem('sessionId', new ObjectId().toString())
    },
};

export const deviceId = {
    get() {
        const did = sessionStorage.getItem('deviceId')
        if (!did) {
            did = (crypto.randomUUID?.() || Math.random().toString(36).slice(2)) + Date.now();
            sessionStorage.setItem('deviceId', did)
        }
        return did;
    },
};
