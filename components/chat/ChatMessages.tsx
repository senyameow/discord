'use client'
import { Member, Message, Profile } from '@prisma/client';
import React, { ElementRef, Fragment, useEffect, useRef } from 'react'
import ChatWelcome from './ChatWelcome';
import { useChatQuery } from '../hooks/use-chat';
import { Loader2, ServerCrash } from 'lucide-react';
import ChatMessage from './ChatMessage';
import { format, formatDistance, formatRelative, subDays } from 'date-fns'
import { useChatSocket } from '../hooks/use-chat-socket';
import { useChatScroll } from '../hooks/use-chat-scroll';

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
    const updateKey = `chat:${chatId}/messages/update`
    // const updateKey = 'update'
    const addKey = `chat:${chatId}:messages`

    const { data, fetchNextPage, hasNextPage, isFetchingNextPage, status } = useChatQuery({ queryKey, apiUrl, paramKey, paramValue })

    useChatSocket({ addKey, updateKey, queryKey })

    // но вот мы все сделали, но это все хорошо, а как получить то смски и вывести их?


    // теперь наша задача сделать так, что у нас загружается отведенное количество смсок
    // + если у нас выполняется hasNextPage, то мы не выводим уже приветствие (оно в самом начале)
    // и когда мы скролим до определенного момента, то у нас прогружаются смски
    // и так мы можем проскролить все страницы
    // для этого можно сделать 2 рефа (для чата и для конца)

    const chatRef = useRef<ElementRef<'div'>>(null)
    const bottomRef = useRef<ElementRef<'div'>>(null)

    // один кидаем на весь чат
    // создаем в самом низу чата еще один див и кидаем второй реф в него

    // useEffect(() => {
    //     console.log(chatRef.current?.scrollTop)

    // }, [chatRef.current?.scrollTop, chatRef])

    // console.log(chatRef.current?.scrollTop)


    // console.log(bottomRef.current)

    // по факту, чтобы сделать фетч по скроллу, мне нужен всего 1 реф на чат, и все, ну еще пропихнуть функцию на фетч некст страницы


    // если мы хотим сделать еще функционал, что при новом сообщении у нас автоскролл до него, а не просто чат стоит на месте, и мы должны скролить
    // то тогда нам уже надо добавить маркер на конец чата, чтобы понимать до куда автоскроллить

    const fetchMore = () => {
        fetchNextPage()
    }

    useChatScroll({ chatRef, bottomRef, fetchMore, shouldFetchNextPage: !isFetchingNextPage && !!hasNextPage, count: data?.pages[0].items.length ?? 0 })



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
        <div ref={chatRef} className='flex-1 flex flex-col overflow-y-auto border-rose-400 border'>
            {!hasNextPage && <div className='flex-1 border border-blue-300' />}
            {!hasNextPage && <ChatWelcome type={type} name={name} />}
            {/* если у нас есть следующая страница, при ее загрузке мы должны что-то показывать */}
            {hasNextPage && (
                <div className='flex justify-center items-center'>
                    {isFetchingNextPage ? (
                        <Loader2 className='animate-spin w-12 h-12 text-zinc-400 ' />
                    ) : (
                        <button onClick={() => fetchNextPage()} className='text-zinc-400 text-sm py-4 '>
                            load messages
                        </button>
                    )}
                    {/* если фетчится страничка, то лоадер */}
                    {/* если зафетчилось, то кнопка с онкликом fetchNextPage, который приходит с useChatQuery */}
                    {/* теперь можно сделать по скролу, т.к. на кнопку нажимать каждый раз, ну такое себе)) */}
                    {/* для этого делаем новый хук, который должен будет понимать с помощью этих рефов, когда начать фетчить новую страницу */}
                </div>
            )}
            <div className='flex flex-col-reverse'>
                {data?.pages?.map((group, ind) => (
                    <Fragment key={ind}>
                        {group.items.map((message: MessageWithMembersWithProfiles) => (
                            <ChatMessage key={message.id} id={message.id} isUpdated={message.updated_At !== message.created_At} timestamp={format(new Date(message.created_At), DATE_FORMAT)} deleted={message.deleted} member={message.member} fileUrl={message.fileUrl!} socketQuery={socketQuery} socketUrl={socketUrl} content={message.content} currentMember={member} />
                        ))} {/* для нормального формата даты, проще заюзать date-fns */}
                    </Fragment>
                ))}
            </div>

            <div ref={bottomRef} />


        </div>
    )
}

export default ChatMessages