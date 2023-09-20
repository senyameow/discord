import { MediaRoom } from '@/components/MediaRoom';
import ChatHeader from '@/components/chat/ChatHeader';
import ChatInput from '@/components/chat/ChatInput';
import ChatMessages from '@/components/chat/ChatMessages';
import { currentProfile } from '@/lib/current-profile';
import { db } from '@/lib/db';
import { redirectToSignIn } from '@clerk/nextjs';
import { ChannelType } from '@prisma/client';
import { redirect } from 'next/navigation';
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
            profileId: profile.id
        }
    })


    // мы должны даже продумать кейс, если юзер пытается через юрл зайти на сервак, поэтому сразу это подсекаем тут

    if (!member || !channel) {
        redirect('/')
    }

    // просто тогда редиректим на мейн пэйдж, а оттуда уже нас кинет в general


    return (
        <div className='flex flex-col h-full bg-white dark:bg-[#313338]'>
            <ChatHeader name={channel.name} serverId={channel.serverId} type='channel' image_url={''} />
            {channel.type === ChannelType.TEXT && <ChatMessages name={channel.name} member={member} chatId={channel.id} type='channel' apiUrl='/api/messages' socketUrl='/api/socket/messages' socketQuery={{ channelId: channel.id, serverId: channel.serverId }} paramKey='channelId' paramValue={channel.id} />}
            {channel.type === ChannelType.AUDIO && <MediaRoom serverId={params?.serverId} chatId={channel.id} audio={true} video={false} />}
            {channel.type === ChannelType.VIDEO && <MediaRoom serverId={params?.serverId} chatId={channel.id} audio={false} video={true} />}
            <ChatInput name={channel.name} type='channel' apiUrl='/api/socket/messages' query={{
                channelId: channel.id,
                serverId: channel.serverId
            }} /> {/* как мы понимаем, что нам нужно кидать такие пропсы? Сначала думаем, надо ли нам переиспользовать - ДА, что будет вообще компонент делать? - делать пост запрос на апишку и размещать смску в бд */}
            {/* как будет сервак понимать куда сторить смску? - переходить по апишке, и делать запрос по айдишнику сервера и канала, на котором сидим */}
            {/* как получить эти адишники? - через парамсы или можно передать вот так в квери */}
            {/* если передаем через парамсы, как будем ловить айдишник для юзера, и на какую апишку будет запрос? */}
            {/* тут начинаются проблемы, и мы понимаем, что проще сказать, что окей у нас есть инпут, в который мы будем кидать юрл апишки, т.к. их будет больше чем 1 */}
            {/* также будем прокидывать name канала, т.к. хотим видеть, куда отправляем смску в плэйсхолдере */}
            {/* и кинем квери, потому что для юзера будет другая апишка и кери придется добавлять еще айди юзера туда */}
            {/* поэтому мы и не юзаем парамсы, т.к. через них будет нереально получить айдишник юзера (мб реально, но не через парамсы, проще просто через qs) */}

            {/* но даже так можно было бы рассматривать решение через парамсы, но все убивает резко то, что сокет не работает с api , и мы вынуждены через app router (т.е. pages) а там уже парамсы не поюзаешь ((( */}
        </div>
    )
}

export default ChannelIdPage