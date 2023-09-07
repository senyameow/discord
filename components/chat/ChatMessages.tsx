'use client'
import { Member, Message, Profile } from '@prisma/client';
import React, { Fragment } from 'react'
import ChatWelcome from './ChatWelcome';
import { useChatQuery } from '../hooks/use-chat';
import { Loader2, ServerCrash } from 'lucide-react';
import ChatMessage from './ChatMessage';
import { format, formatDistance, formatRelative, subDays } from 'date-fns'

const DATE_FORMAT = 'd MMM yyyy, HH:mm' // так можно задать темплейт для даты (формата)


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

// понадоилось сделать тип, делаем

type MessageWithMembersWithProfiles = Message & {
    member: Member & {
        profile: Profile
    }
} // вот так можно сделать тип, просто как конструктор собрать (как мы делаем с помоью инклюда в призме)


const ChatMessages = ({ name, chatId, member, apiUrl, socketUrl, socketQuery, paramKey, paramValue, type }: ChatMessagesProps) => {

    const queryKey = `chat:${chatId}`

    const { data, fetchNextPage, hasNextPage, isFetchingNextPage, status } = useChatQuery({ queryKey, apiUrl, paramKey, paramValue })

    // но вот мы все сделали, но это все хорошо, а как получить то смски и вывести их?

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
            <div className='flex flex-col-reverse'>
                {data?.pages?.map((group, ind) => (
                    <Fragment key={ind}>
                        {group.items.map((message: MessageWithMembersWithProfiles) => (
                            <ChatMessage id={message.id} isUpdated={message.updated_At !== message.created_At} timestamp={format(new Date(message.created_At), DATE_FORMAT)} deleted={message.deleted} member={message.member} fileUrl={message.fileUrl!} socketQuery={socketQuery} socketUrl={socketUrl} content={message.content} currentMember={member} />
                        ))} {/* для нормального формата даты, проще заюзать date-fns */}
                    </Fragment>
                ))}
            </div>


        </div>
    )
}

export default ChatMessages