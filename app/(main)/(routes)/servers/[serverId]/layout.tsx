import ServerSidebar from '@/components/server/ServerSIdebar'
import { currentProfile } from '@/lib/current-profile'
import { db } from '@/lib/db'
import { redirectToSignIn } from '@clerk/nextjs'
import { redirect } from 'next/navigation'
import React from 'react'

const ServerIdLayout = async ({ children, params }: { children: React.ReactNode, params: { serverId: string } }) => {

    const profile = await currentProfile() // получаем профайл (если его нет то редиректим чувака регаться)

    if (!profile) return redirectToSignIn()

    // что есть в этом лэйауте?
    // название сервака с дропдауном
    // кнопка поиска каналов
    // 2 типа каналов (+ кнопка, где их можно добавлять)
    // и members (просто выводим аву, имя и роль всех чуваков на сервере)

    // поэтому мы должны получить этот сервер

    const server = await db.server.findUnique({
        where: {
            id: params.serverId, // но этого не достаточно, потому что если чувак знает айди сервера, то он сразу на него зайдет, значит нужна проверка того, что он есть на этом сервере

            members: {
                some: {
                    profileId: profile.id
                }
            }

        }
    })

    if (!server) return redirect('/')

    return (
        <div className='h-full'>
            <div className='hidden md:flex h-full w-60 z-20 flex-col inset-y-0 fixed'>
                <ServerSidebar serverId={params.serverId} />
            </div>
            <main className='h-full md:pl-60'>
                {children}
            </main>
        </div>
    )
}

export default ServerIdLayout