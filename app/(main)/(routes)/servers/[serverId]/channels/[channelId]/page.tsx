import { currentProfile } from '@/lib/current-profile';
import { db } from '@/lib/db';
import { redirectToSignIn } from '@clerk/nextjs';
import React from 'react'

interface ChannelIdPageProps { // если у нас вложенные друг в друга (даже через одного) руты в скобочках
    // то они тоже окажутся в парамсах!! что очень замечательно
    // в нашем случае мы можем забрать и сервер айди и айди канала
    params: {

        serverId: string;
        channelId: string
    }
}

const ChannelIdPage = async ({ params }: ChannelIdPageProps) => {

    const profile = await currentProfile()

    if (!profile) return redirectToSignIn()

    const channel = await db.channel.findUnique({ // находим канал
        where: {
            serverId: params.serverId,
            id: params.channelId
        }
    })

    const member = await db.member.findFirst({
        where: {
            serverId: params.serverId,
            id: profile.id
        }
    })

    return (
        <div>ChannelIdPage</div>
    )
}

export default ChannelIdPage