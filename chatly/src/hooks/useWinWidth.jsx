import { useEffect, useState } from "react";

const MOBILE_WIDTH = 480;

export function useWinWidth() {
  const getWidth = () =>
    typeof window !== "undefined" ? window.innerWidth : MOBILE_WIDTH;

  const [winWidth, setWinWidth] = useState(getWidth);
  const [isMobile, setIsMobile] = useState(getWidth() <= MOBILE_WIDTH);

  useEffect(() => {
    const update = () => {
      const width = window.innerWidth;
      setWinWidth(width);
      setIsMobile(width <= MOBILE_WIDTH);
    };

    update();

    window.addEventListener("resize", update);
    window.addEventListener("orientationchange", update);

    return () => {
      window.removeEventListener("resize", update);
      window.removeEventListener("orientationchange", update);
    };
  }, []);

  return { winWidth, isMobile };
}