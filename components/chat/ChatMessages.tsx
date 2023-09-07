'use client'
import { Member } from '@prisma/client';
import React from 'react'
import ChatWelcome from './ChatWelcome';
import { useChatQuery } from '../hooks/use-chat';
import { Loader2, ServerCrash } from 'lucide-react';

// какие пропсы мне нужны, чтобы сделать чат, и чтобы его можно было заюзать и для каналов и для 1 х 1?

interface ChatMessagesProps {
    name: string;
    chatId: string;
    member: Member;
    apiUrl: string;
    socketUrl: string;
    socketQuery: Record<string, string>;
    paramKey: 'channelId' | 'conversationId';
    paramValue: string;
    type: 'channel' | 'conversation'
}



const ChatMessages = ({ name, chatId, member, apiUrl, socketUrl, socketQuery, paramKey, paramValue, type }: ChatMessagesProps) => {

    const queryKey = `chat:${chatId}`

    const { data, fetchNextPage, hasNextPage, isFetchingNextPage, status } = useChatQuery({ queryKey, apiUrl, paramKey, paramValue })

    if (status === 'loading') {
        return (
            <div className='flex flex-col flex-1 justify-center items-center'> {/* просто ставим лоадер посередине */}
                <Loader2 className='h-7 w-7 text-zinc-500 animate-spin my-4' />
                <p className='text-sm text-zinc-400 dark:text-zinc-300'>
                    Loading Messages...
                </p>
            </div>
        )
    }
    if (status === 'error') {
        return (
            <div className='flex flex-col flex-1 justify-center items-center'> {/* просто ставим лоадер посередине */}
                <ServerCrash className='h-7 w-7 text-zinc-500  my-4' />
                <p className='text-sm text-zinc-400 dark:text-zinc-300'>
                    seems that something went wrong
                </p>
            </div>
        )
    }

    return (
        <div className='flex-1 flex flex-col overflow-y-auto border-rose-400 border'>
            <div className='flex-1 border border-blue-300' />
            <ChatWelcome type={type} name={name} />
        </div>
    )
}

export default ChatMessages