import { useEffect, useState } from 'react'

export function useWinWidth() {
    const [winSize, setWinSize] = useState(() => window.innerWidth)

    useEffect(() => {
        const onResize = () => {
            setWinSize(window.innerWidth)
        }
        window.addEventListener('resize', onResize)
        return () => window.removeEventListener('resize', onResize)
    }, [])

    return { winSize }
}