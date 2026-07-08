import { useEffect, useState } from "react";
import { invoke } from "@tauri-apps/api/core";


const defaultSafeArea = {
    top: 0,
    bottom: 0,
    left: 0,
    right: 0,
};



function getCssSafeArea() {

    const topEl = document.createElement("div");

    topEl.style.cssText = `
        position: fixed;
        top: 0;
        left: 0;
        height: env(safe-area-inset-top);
        width: 1px;
        pointer-events: none;
        visibility: hidden;
    `;


    const bottomEl = document.createElement("div");

    bottomEl.style.cssText = `
        position: fixed;
        bottom: 0;
        left: 0;
        height: env(safe-area-inset-bottom);
        width: 1px;
        pointer-events: none;
        visibility: hidden;
    `;


    document.body.appendChild(topEl);
    document.body.appendChild(bottomEl);


    const result = {
        top: topEl.getBoundingClientRect().height,
        bottom: bottomEl.getBoundingClientRect().height,
        left: 0,
        right: 0,
    };


    topEl.remove();
    bottomEl.remove();


    return result;
}



export function useSafeArea() {


    const [safeArea, setSafeArea] =
        useState(defaultSafeArea);



    useEffect(() => {


        let mounted = true;


        async function update() {


            // 1. 优先使用 Rust 原生获取
            try {

                const native =
                    await invoke("get_safe_area");


                if (
                    native &&
                    typeof native.top === "number"
                ) {

                    if(mounted){

                        setSafeArea({
                            top: native.top,
                            bottom: native.bottom ?? 0,
                            left: native.left ?? 0,
                            right: native.right ?? 0,
                        });

                    }


                    return;
                }


            } catch (e) {

                // Desktop 或 command 不存在
            }



            // 2. CSS fallback

            const cssSafeArea =
                getCssSafeArea();


            if(mounted){

                setSafeArea(cssSafeArea);

            }

        }



        // 等 WebView 初始化
        requestAnimationFrame(update);



        window.addEventListener(
            "resize",
            update
        );


        return ()=>{

            mounted = false;


            window.removeEventListener(
                "resize",
                update
            );

        };


    }, []);



    return safeArea;
}