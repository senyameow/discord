'use client'
import { cn } from '@/lib/utils';
import { Channel, ChannelType, MemberRole, Server } from '@prisma/client'
import { Edit, Hash, Lock, Mic, Trash, Video } from 'lucide-react';
import { useParams, useRouter } from 'next/navigation';
import React from 'react'
import { ActionTooltip } from '../navigation/action-tooltip';

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



    // нам нужны бойцы для функционала нажатия на канал (router, params)

    const router = useRouter()
    const params = useParams()

    return (
        <button onClick={() => { }} className='group rounded-md items-center flex gap-2 w-full hover:dark:bg-zinc-700/50 hover:bg-zinc-700/10 py-2'>
            <Icon className={cn('dark:text-zinc-400 text-zinc-500 flex-shrink-0 w-5 h-5', params?.channelId === channel.id && 'bg-zinc-700/20 dark:bg-zinc-700')} /> {/* нужен cn, т.к. нужно если мы сейчас в этом канале, то делаем bg светлее или типо того */}
            <span className={cn(`line-clamp-1 font-semibold text-sm text-zinc-500 dark:text-zinc-400 group-hover:text-zinc-600 dark:group-hover:text-zinc-300 transition`, params?.channelId === channel.id && 'text-primary dark:text-zinc-200 dark:group-hover:text-white')}>{channel.name}</span>
            {channel.name === 'general' && role !== 'GUEST' && (
                <div className='ml-auto flex items-center mr-2'>
                    <Lock className={cn(`w-4 h-4 invisible transition font-semibold group-hover:visible`, params?.channelId === channel.id && 'visible dark:bg-zinc-200 group-hover:bg-white')} />
                </div>
            )}
            {channel.name !== 'general' && role !== 'GUEST' && (
                <div className='ml-auto flex items-center mr-2 gap-2'>
                    <ActionTooltip label='Edit'>
                        <Edit className={cn(`w-4 h-4 invisible hover:text-zinc-400 text-zinc-500 transition font-semibold group-hover:visible`, params?.channelId === channel.id && 'visible dark:bg-zinc-200 group-hover:bg-white')} />
                    </ActionTooltip>
                    <ActionTooltip label='Edit'>
                        <Trash className={cn(`w-4 h-4 invisible hover:text-zinc-400 text-zinc-500 transition font-semibold group-hover:visible`, params?.channelId === channel.id && 'visible dark:bg-zinc-200 group-hover:bg-white')} />
                    </ActionTooltip>
                </div>
            )}

        </button>
    )
}

export default ServerChannel