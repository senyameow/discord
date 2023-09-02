'use client'

import { useEffect, useState } from "react"
import { ServerModal } from "../modals/createServerModal"

// здесь мы просто делаем провайдер в который обернем все приложение
// это нам позволит доставать любые модалки из любого места (?*)


export const ModalProvider = () => {

    const [isMounted, setIsMounted] = useState(false)

    useEffect(() => {
        setIsMounted(true)
    }, [])

    if (!isMounted) return null

    return (
        <>
            <ServerModal />
        </>
    )
}