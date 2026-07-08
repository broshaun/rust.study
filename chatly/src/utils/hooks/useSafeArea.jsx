import { useEffect, useState } from "react";


export function useSafeArea(){

    const [safeArea,setSafeArea] = useState({
        top:0,
        bottom:0,
    });


    useEffect(()=>{

        const topEl = document.createElement("div");
        topEl.style.cssText = `
            position: fixed;
            top:0;
            height: env(safe-area-inset-top);
            width:0;
            visibility:hidden;
        `;


        const bottomEl = document.createElement("div");
        bottomEl.style.cssText = `
            position: fixed;
            bottom:0;
            height: env(safe-area-inset-bottom);
            width:0;
            visibility:hidden;
        `;


        document.body.appendChild(topEl);
        document.body.appendChild(bottomEl);


        const update = ()=>{

            setSafeArea({
                top: topEl.offsetHeight,
                bottom: bottomEl.offsetHeight,
            });

        };


        update();


        window.addEventListener(
            "resize",
            update
        );


        return ()=>{

            window.removeEventListener(
                "resize",
                update
            );

            topEl.remove();
            bottomEl.remove();

        };


    },[]);


    return safeArea;
}