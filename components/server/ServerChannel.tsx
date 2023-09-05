'use client'
import { cn } from '@/lib/utils';
import { Channel, ChannelType, MemberRole, Server } from '@prisma/client'
import { Edit, Hash, Lock, Mic, Trash, Video } from 'lucide-react';
import { useParams, useRouter } from 'next/navigation';
import React from 'react'
import { ActionTooltip } from '../navigation/action-tooltip';
import { ModalType, useModal } from '../hooks/use-modal-store';

interface ServerChannelProps {
    channel: Channel;
    server: Server;
    role?: MemberRole;
}

const iconMap = {
    [ChannelType.TEXT]: Hash,
    [ChannelType.AUDIO]: Mic,
    [ChannelType.VIDEO]: Video
} // или можно так определять иконку, просто потом создаем переменную Icon, где укажем тип нажего канала (который придет из пропсов)

const ServerChannel = ({ channel, server, role }: ServerChannelProps) => {

    const Icon = iconMap[channel.type]

    const { onOpen } = useModal()



    // нам нужны бойцы для функционала нажатия на канал (router, params)

    const router = useRouter()
    const params = useParams()

    const onClick = () => {
        router.push(`/servers/${server.id}/channels/${channel.id}`)
    }
    // тут возникает проблема, у меня в кнопке много онкликов (едит, делит) и сейчас я добавляю еще один делит
    // следовательно из-за баблинга у меня кликается короче все, и короче все плохо, нопки друг на друге
    // как фиксить будем?

    // делаем еще одну функцию 

    const onAction = (e: React.MouseEvent, action: ModalType) => {
        e.stopPropagation() // убиваем фазы баблинга и еще чего-то не помню как его 
        onOpen(action, { server, channel })
    }

    return (
        <button onClick={onClick} className='group rounded-md items-center flex gap-2 w-full hover:dark:bg-zinc-700/50 hover:bg-zinc-700/10 py-2'>
            <Icon className={cn('dark:text-zinc-400 text-zinc-500 flex-shrink-0 w-5 h-5')} /> {/* нужен cn, т.к. нужно если мы сейчас в этом канале, то делаем bg светлее или типо того */}
            <span className={cn(`line-clamp-1 font-semibold text-sm text-zinc-500 dark:text-zinc-400 group-hover:text-zinc-600 dark:group-hover:text-zinc-300 transition`, params?.channelId === channel.id && 'text-primary dark:text-zinc-200 dark:group-hover:text-white')}>{channel.name}</span>
            {channel.name === 'general' && role !== 'GUEST' && (
                <div className='ml-auto flex items-center mr-2'>
                    <Lock className={cn(`w-4 h-4 invisible transition font-semibold group-hover:visible bg-transparent`, params?.channelId === channel.id && 'visible group-hover:bg-white')} />
                </div>
            )}
            {channel.name !== 'general' && role !== 'GUEST' && (
                <div className='ml-auto flex items-center mr-2 gap-2'>
                    <ActionTooltip label='Edit'>
                        <Edit onClick={(e) => onAction(e, 'editChannel')} className={cn(`w-4 h-4 invisible hover:text-zinc-400 text-zinc-500 transition font-semibold group-hover:visible`, params?.channelId === channel.id && 'visible')} />
                    </ActionTooltip>
                    <ActionTooltip label='Delete'>
                        <Trash onClick={(e) => onAction(e, 'deleteChannel')} className={cn(`w-4 h-4 invisible hover:text-zinc-400 text-zinc-500 transition font-semibold group-hover:visible`, params?.channelId === channel.id && 'visible')} />
                    </ActionTooltip>
                </div>
            )}

        </button>
    )
}

export default ServerChannel