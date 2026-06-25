import React, { useMemo } from "react";
import { userId, deviceId, sessionId } from "utils/identity";

export function BootstrapGate({ children }) {
    const ready = useMemo(() => {
        try {
            return !!userId.get() && !!deviceId.get() && !!sessionId.get();
        } catch {
            return false;
        }
    }, []);

    if (!ready) {
        return (
            <div style={{ padding: 20 }}>
                Loading identity...
            </div>
        );
    }

    return children;
}