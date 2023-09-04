'use client'
import { ServerWithMembersWithProfiles } from '@/types'
import React, { useEffect, useState } from 'react'
import { Search } from 'lucide-react';
import {
    CommandDialog,
    CommandEmpty,
    CommandGroup,
    CommandInput,
    CommandItem,
    CommandList,
    CommandSeparator,
    CommandShortcut,
} from "@/components/ui/command"
import { redirect, useParams, useRouter } from 'next/navigation';
import { ChannelType } from '@prisma/client';

interface ServerSearchProps {
    data: { // дата это просто группа элементов в поиске
        label: string; // на надо прокинуть название для типа канала
        type: 'channel' | 'member'; // тип того, что мы рендерим
        data: { // и остается дата, которая может поступать как для юзера так и для каналов
            // просто рендер будет немного разных компонентов
            icon: React.ReactNode;
            name: string;
            id: string;
        }[] | undefined // дата.дата это все каналы (имена иконки айдишники в каждой группе)
    }[]
}

const ServerSearch = ({ data }: ServerSearchProps) => {

    const [open, setOpen] = useState(false)

    useEffect(() => {
        const down = (e: KeyboardEvent) => {
            if (e.key === "k" && (e.metaKey || e.ctrlKey)) {
                e.preventDefault()
                setOpen((open) => !open)
            }
        }

        document.addEventListener("keydown", down)
        return () => document.removeEventListener("keydown", down)
    }, []) // таким образом реализуем шорткат (очень круто + полезно)

    const router = useRouter()
    const params = useParams()

    // теперь при нажатии на айтем надо перенаправлять чуваков на каналы (как это можно реализовать)
    // явно нам нужен онклик, который кидаем в сам айтем
    // как получить инфу куда кидать чела? 
    // например, я нажал на текстовый канал general. как программа узнает, что она должна кинуть меня в тот чат?
    // или, например, я нажал на участника сервера, и уже она меня должна кинуть в диалог с этим участником
    // явно, что *кидать* прога будет с помощью раутера
    // у нас есть 2 типа каналов (1 на 1), т.е. тип members, и тип channelsб где будут уже разные текстовые или войс каналы(а как с войсом?)

    // для этого берем тип и айдишник того, на что мы нажали, т.е. прокинем в айтем и айдишник будет просто айдишником канала
    // и прокинем в тип channel.type, тем самым будем знать какой тип канала и соответственно будем редиректить юзера на ui чата
    // либо с юзером 1 на 1, либо в общий чат со всеми

    const onClick = ({ id, type }: { id: string, type: 'member' | 'channel' }) => {
        // сначала закроем окошко
        setOpen(false)

        if (type === 'member') return router.push(`/servers/${params.serverId}/conversations/${id}`)
        // мы идем на сервера, т.к. нам надо знать на каком сервере искать (чтобы не создавать квери, когда можно без него)
        // с помощью парамсов получаем значение в скобочках
        // и с помощью айдишника у нас будет динамический раут, т.е. диалог с каждым челом будет по разному рауту
        if (type === 'channel') return router.push(`/servers/${params.serverId}/channels/${id}`)
    }

    return (
        <>
            <button onClick={() => setOpen(true)} className='w-full p-2 flex items-center gap-2 rounded-md transition bg-zinc-700/10 group hover:bg-zinc-700/90'>
                <p className='font-semibold text-sm text-zinc-500 dark:text-zinc-400 group-hover:text-zinc-600 dark:group-hover:text-zinc-300'>
                    Search
                </p>
                <kbd className='ml-auto pointer-events-none inline-flex h-5 items-center'>
                    <span className='text-xs'>ctrl&nbsp;</span>K {/* прикольная штука, можно делать шортакаты */}
                </kbd>
            </button>
            <CommandDialog open={open} onOpenChange={setOpen}>
                <CommandInput placeholder='find channel or member' />
                <CommandList>
                    <CommandEmpty>No results found</CommandEmpty>
                    {data.map(({ label, type, data }) => {
                        if (!data?.length) return null

                        return (
                            <CommandGroup key={label} heading={label}>
                                {data.map(({ id, icon, name }) => {
                                    return (
                                        <CommandItem onSelect={() => onClick({ id, type })} key={id}>
                                            {icon}
                                            <span>{name}</span>
                                        </CommandItem>
                                    )
                                })}
                            </CommandGroup>
                        )
                    })}
                </CommandList>
            </CommandDialog>
        </>
    )
}

export default ServerSearch