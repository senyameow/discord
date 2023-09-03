import { useEffect, useState } from "react"


export const useInvite = () => {
    const [isMounted, setIsMounted] = useState(false)

    useEffect(() => {
        setIsMounted(true)
    }, [])

    const link = typeof window !== 'undefined' && window.location.origin ? window.location.origin : '' // так можно получить линк

    if (!isMounted) return ''

    return link
}
