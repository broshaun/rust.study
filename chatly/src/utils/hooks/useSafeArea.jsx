import { useEffect, useState } from "react";


const defaultSafeArea = {
    top: 0,
    bottom: 0,
    left: 0,
    right: 0,
};


function getSafeArea() {
    const style =
        getComputedStyle(
            document.documentElement
        );

    return {
        top:
            parseFloat(style.getPropertyValue("--safe-area-top")),
        bottom:
            parseFloat(style.getPropertyValue("--safe-area-bottom")),
        left:
            parseFloat(style.getPropertyValue("--safe-area-left")),
        right:
            parseFloat(style.getPropertyValue("--safe-area-right")),
    };
}



export function useSafeArea() {
    const [safeArea, setSafeArea] = useState(defaultSafeArea);
    useEffect(() => {
        const update = () => {
            setSafeArea(getSafeArea());
        };
        // 等待 WebView 初始化
        requestAnimationFrame(update);
        window.addEventListener(
            "resize",
            update
        );
        return () => {
            window.removeEventListener("resize", update);
        };
    }, []);

    return safeArea;
}