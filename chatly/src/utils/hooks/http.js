import { invoke } from "@tauri-apps/api/core";

function createTimeout(ms = 5000) {
    return new Promise((_, reject) => {
        setTimeout(() => reject(new Error(`请求超时 ${ms}ms`)), ms);
    });
}

const get = async (url) => {
    try {
        const rawRes = await Promise.race([
            invoke("http_get", { options: { url } }),
            createTimeout(5000)
        ]);

        return {
            code: 200,
            data: rawRes,
            message: "success"
        };
    } catch (err) {
        return {
            code: 404,
            data: null,
            message: err.message || String(err)
        };
    }
};

export const http = {
    get
};