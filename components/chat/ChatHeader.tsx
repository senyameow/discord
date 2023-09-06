import { Hash, Menu } from 'lucide-react';
import React from 'react'
import MobileToggle from '../MobileToggle';
import Image from 'next/image';
import UserAvatar from '../UserAvatar';
import { SocketIndicator } from '../SocketIndicator';

// что мне нужно для хедера?

interface ChatHeaderProps {
    serverId: string; // пока хз для чего
    name: string; // имя канала будет написано сверху
    type: 'channel' | 'conversation'; // чтобы понимать, что мы рендерим (либо общий чат, где будут смски всех мемберов чата)
    // либо уже 1х1 разговор
    image_url: string; // хз для чего
}

const ChatHeader = ({ serverId, name, type, image_url }: ChatHeaderProps) => {
    return (
        <div className='text-md font-semibold px-3 flex items-center h-12 border-neitral-200 dark:border-neutral-800 border-b-2'>
            <MobileToggle serverId={serverId} />
            {type === 'channel' && (
                <Hash className='text-zinc-500 dark:text-zinc-400 w-5 h-5' />

            )}
            <UserAvatar image_url={image_url} className='dark:w-8 dark:h-8 rounded-full z-[99]' />
            <p className='font-semibold text-md'>{name}</p>
            <div className='ml-auto'>
                <SocketIndicator />
            </div>
        </div>
    )
}

export default ChatHeader