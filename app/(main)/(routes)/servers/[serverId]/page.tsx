import { currentProfile } from '@/lib/current-profile'
import { db } from '@/lib/db'
import { redirectToSignIn } from '@clerk/nextjs'
import { redirect } from 'next/navigation'
import React from 'react'

interface ServerPageProps {
    params: {
        serverId: string
    }
}

const ServerPage = async ({ params }: ServerPageProps) => {

    const profile = await currentProfile()

    if (!profile) return redirectToSignIn()

    const server = await db.server.findUnique({
        where: {
            id: params.serverId,
            members: {
                some: { // мы должны чекнуть, что мы есть на этом серваке (хотя бы 1 юзер этого сервера - это мы)
                    profileId: profile.id
                }
            }
        },
        include: {
            Channel: {
                where: {
                    name: 'general'
                },
                orderBy: {
                    created_at: 'asc'
                }
            }

        }

    })

    const initialChannel = server?.Channel[0] // и забираем из списка первый элемент (general стоит первым, т.к. первый создается) и не может удалиться



    return redirect(`/servers/${params.serverId}/channels/${initialChannel?.id}`)
}

export default ServerPage