import { ObjectId } from "bson";

/* =========================
   Keys
========================= */
const KEY = {
    user: "app_user_id",
    tenant: "app_tenant_id",
};

/* =========================
   storage
========================= */
const ls = {
    get: (k) => localStorage.getItem(k),
    set: (k, v) => localStorage.setItem(k, v),
    del: (k) => localStorage.removeItem(k),
};

/* =========================
   USER (persistent)
========================= */
export const User = {
    get() {
        const id = ls.get(KEY.user);
        if (!id) throw new Error("[identity] userId missing");
        return id;
    },

    set(id) {
        if (id) ls.set(KEY.user, id);
    },
};

/* =========================
   TENANT (persistent)
========================= */
export const Tenant = {
    get() {
        const id = ls.get(KEY.tenant);
        if (!id) throw new Error("[identity] tenantId missing");
        return id;
    },

    set(id) {
        if (id) ls.set(KEY.tenant, id);
    },
};

/* =========================
   SESSION (runtime only)
========================= */
let sessionId;

export const Session = {
    get() {
        if (!sessionId) {
            sessionId = new ObjectId().toString();
        }
        return sessionId;
    },
};

/* =========================
   DEVICE (runtime only)
========================= */
let deviceId;

export const Device = {
    get() {
        if (!deviceId) {
            deviceId =
                (crypto.randomUUID?.() ||
                    Math.random().toString(36).slice(2)) +
                Date.now();
        }
        return deviceId;
    },
};

/* =========================
   CLIENT (derived only)
========================= */
const sha256 = async (str) => {
    const buf = await crypto.subtle.digest(
        "SHA-256",
        new TextEncoder().encode(str)
    );

    return [...new Uint8Array(buf)]
        .map((b) => b.toString(16).padStart(2, "0"))
        .join("");
};

export const Client = {
    async get() {
        const userId = userId.get();
        const raw = `${Device.get()}:${userId}`;
        return sha256(raw);
    },
};