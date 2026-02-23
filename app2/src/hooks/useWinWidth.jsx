import { useEffect, useState } from 'react'

export function useWinWidth() {
    const [winSize, setWinSize] = useState(() => window.innerWidth)
    const [isMobile, setIsMobile] = useState(() => window.innerWidth <= 415)

    useEffect(() => {
        const onResize = () => {
            const currentWidth = window.innerWidth
            setWinSize(currentWidth)
            setIsMobile(currentWidth <= 415)
        }
        window.addEventListener('resize', onResize)
        return () => window.removeEventListener('resize', onResize)
    }, [])
    return { winSize, isMobile }
}