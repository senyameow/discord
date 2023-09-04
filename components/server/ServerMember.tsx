'use client'
import { cn } from '@/lib/utils'
import { ServerWithMembersWithProfiles } from '@/types'
import { Member, MemberRole, Profile } from '@prisma/client'
import { Server } from 'http'
import { ShieldAlert, ShieldCheck, icons } from 'lucide-react'
import { useParams, useRouter } from 'next/navigation'
import React from 'react'
import UserAvatar from '../UserAvatar'

interface ServerMemberProps {
    member: Member & { profile: Profile } // не паримся и просто мембера передаем, от него уже все возьмем тут
    server: ServerWithMembersWithProfiles
}

// делаем динамические иконки для юзеров сервера

const roleIconMap = {
    [MemberRole.GUEST]: null,
    [MemberRole.MODERATOR]: <ShieldCheck className='w-4 h-4 ml-2 text-indigo-500' />,
    [MemberRole.ADMIN]: <ShieldAlert className='w-4 h-4 ml-2 text-rose-500' />,
}

// т.е. тут есть 2 главных пути, как можно работать с динамическими иконками
// делаем мапу со всеми вариантами в скобочках
// и либо просто даем названия (тип будет Icon (Lucid Icon)), делаем const Icon с большой буквы и используем как отдельный реакт компонент
// либо сразу прокидываем иконку, как сделал здесь, создаем уже const icon с маленькой и в ус не дуем
// просто можем рендерить как {icon}

const ServerMember = ({ member, server }: ServerMemberProps) => {

    const params = useParams()
    const router = useRouter()

    const icon = roleIconMap[member.role]

    return (
        <button className={cn(`group p-2 flex items-center gap-2 w-full hover:bg-zinc-700/10 dark:hover:bg-zinc-700/50 rounded-md`, params?.memberId === member.id && 'bg-zinc-700/20 dark:bg-zinc-700')}>
            <UserAvatar image_url={member.profile.image_url} className='w-6 h-6 md:w-8 md:h-8' />
            <p className={cn(`text-sm text-zinc-500 dark:text-zinc-400 group-hover:text-zinc-600 dark:group-hover:text-zinc-300 transition`, params.memberId === member.id && 'text-primary dark:text-zinc-200 dark:group-hover:text-white')}>{member.profile.name}</p>
            <span className='ml-auto'>{icon}</span>


        </button>
    )
}

export default ServerMember