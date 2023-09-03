'use client'

import { useEffect, useState } from "react"
import { ServerModal } from "../modals/createServerModal"
import { InviteModal } from "../modals/InviteModal"
import { EditServerModal } from "../modals/editServerModal"
import { MembersModal } from "../modals/MembersMoodal"
import { ChannelModal } from "../modals/createChannelModal"
import { LeaveModal } from "../modals/LeaveServerModal"
import { DeleteModal } from "../modals/DeleteServerModal"

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
            <InviteModal />
            <EditServerModal />
            <MembersModal />
            <ChannelModal />
            <LeaveModal />
            <DeleteModal />

        </>
    )
}