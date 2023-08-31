import React from 'react'
import { initialProfile } from '@/lib/initial-profile'
import { db } from '@/lib/db'
import { redirect } from 'next/navigation'
import { InitialModal } from '@/components/modals/initial-modal'

const SetupPage = async () => {

    const profile = await initialProfile() // забираем с помощью эвэйта начальный профиль

    // когда юзер открывает наше приложение, мы сразу ему показываем дискорд канал, либо если он еще нигде не состоит, показываем другой ui,
    // в котором он можем создать или вступить на сервер, например

    // чтобы сделать эту логику, нам надо найти сервер, где в мемберах этого сервера есть этот профиль
    // заюзаем дбшку, чтобы найти такой сервак

    const initialServer = await db.server.findFirst({
        where: {
            members: {
                some: {
                    profileId: profile.id
                }
            }
        }
    }) // найди среди серверов такой, где хотя бы (some) в одной строчке (колонке мемберс) есть наш айдишник чувака

    if (initialServer) return redirect(`servers/${initialServer.id}`) // создадим рут /servers и в него положем [id] рут (динамический)

    return (
        <InitialModal />
    )
}

export default SetupPage