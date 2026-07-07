import { useState,useEffect } from "react";

export function useSafeArea() {

    const [safeArea,setSafeArea] = useState({
        top:0,
        bottom:0,
    });


    useEffect(()=>{

        const get = ()=>{

            const style =
                getComputedStyle(
                    document.documentElement
                );


            const top =
                style.getPropertyValue(
                    "--safe-area-top"
                ) ||
                style.getPropertyValue(
                    "--safe-area-inset-top"
                );


            const bottom =
                style.getPropertyValue(
                    "--safe-area-bottom"
                ) ||
                style.getPropertyValue(
                    "--safe-area-inset-bottom"
                );


            setSafeArea({
                top: parseFloat(top) || 0,
                bottom: parseFloat(bottom) || 0,
            });
        };


        get();


        window.addEventListener(
            "safeAreaChanged",
            get
        );


        return ()=>{
            window.removeEventListener(
                "safeAreaChanged",
                get
            );
        };

    },[]);


    return safeArea;
}