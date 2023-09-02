import { currentProfile } from '@/lib/current-profile';
import { db } from '@/lib/db';
import { ChannelType } from '@prisma/client';
import { redirect } from 'next/navigation';
import React from 'react'
import ServerHeader from './ServerHeader';

interface ServerSidebarProps {
    serverId: string;
}

const ServerSidebar = async ({ serverId }: ServerSidebarProps) => {

    const profile = await currentProfile()

    if (!profile) return redirect('/')

    // ловим сервак

    const server = await db.server.findUnique({
        where: {
            id: serverId
        },
        include: {
            Channel: {
                orderBy: {
                    created_at: 'asc'
                }
            },
            members: {
                include: {
                    profile: true
                },
                orderBy: {
                    role: 'asc'
                }
            }
        }
    })

    if (!server) return redirect('/') // поэксперементировать

    const textChannels = server?.Channel.filter(channel => channel.type === ChannelType.TEXT)
    const audioChannels = server?.Channel.filter(channel => channel.type === ChannelType.AUDIO)
    const videoChannels = server?.Channel.filter(channel => channel.type === ChannelType.VIDEO)

    // разделим наши каналы по их типу (будет легче рендерить проходясь по списку мэпом)

    // получим все мемберов (но себя не надо) Я лежит в profile сейчас
    // просто отфильтруем всех мемберов, где их айдишник не равен профайл.айди

    const members = server?.members.filter(member => member.id !== profile.id) // все, кроме нас

    const role = server?.members.find(member => member.id === profile.id)?.role // вернет нашу роль на сервере

    // т.к. профайл это любой чел, мы должны найти его роль
    // например регается мужик к нам на сервак, у него не может быть админка
    // поэтому мы ищем роль, а не говорим, что если айдишник с нами совпал, то все мы короли танцпола


    return (
        <div className='h-full flex flex-col text-primary bg-[F2F3F5] dark:bg-[2B2D31]'>
            <ServerHeader server={server} role={role} />
        </div>
    )
}

export default ServerSidebar