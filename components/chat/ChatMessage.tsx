'use client'

import { Member, MemberRole, Profile } from '@prisma/client';
import React, { useEffect, useState } from 'react'
import UserAvatar from '../UserAvatar';
import { ActionTooltip } from '../navigation/action-tooltip';
import { Edit, FileIcon, ShieldAlert, ShieldBan, ShieldCheck, Smile, Trash } from 'lucide-react';
import Image from 'next/image';
import { cn } from '@/lib/utils';

import {
    Form,
    FormControl,
    FormField,
    FormItem,
} from '@/components/ui/form'

import * as z from 'zod'
import { zodResolver } from '@hookform/resolvers/zod';
// + импортируем друзей запросов
import qs from 'query-string'
import { useForm } from 'react-hook-form'
import axios from 'axios';

// и для инпута тоже штуку
// и кнопку для сейва, чтобы не придумывать ничо

import { Input } from '../ui/input';
import { Button } from '../ui/button';
import { useModal } from '../hooks/use-modal-store';
import { useParams } from 'next/navigation';
import { useRouter } from 'next/navigation';

interface ChatMessageProps {
    id: string; // всегда айдишник нужен, вдруг понадобится
    content: string; // сам контент (текст)
    member: Member & { // отсюда возьмем аватарку и тд
        profile: Profile
    }
    timestamp: string; // когда отправили
    deleted: boolean; // захендлить ситуацию с удалением (was deleted at ... )
    fileUrl: string; // если кидают файл, то его же надо отобразить
    currentMember: Member;
    isUpdated: boolean; // если обновляют смску, то будет надпись, что обновили

    socketUrl: string; // для сокета
    socketQuery: Record<string, string> // для сокета
}
// по сути мне все это надо, чтобы нормально отрисовать сообщение

const roleIconMap = {
    'GUEST': null,
    'MODERATOR': <ShieldCheck className={'text-indigo-500 w-4 h-4 ml-2'} />,
    'ADMIN': <ShieldCheck className={'text-rose-500 w-4 h-4 ml-2'} />,
}

const formSchema = z.object({
    content: z.string().min(1, ' ')
})

const ChatMessage = ({ id, content, member, timestamp, deleted, fileUrl, currentMember, isUpdated, socketUrl, socketQuery }: ChatMessageProps) => {

    const form = useForm<z.infer<typeof formSchema>>({
        resolver: zodResolver(formSchema),
        defaultValues: {
            content
        }
    })

    useEffect(() => {
        form.reset()
    }, [content])

    const onMemberClick = () => {
        if (member.id === currentMember.id) return

        router.push(`/servers/${params?.serverId}/conversations/${member.id}`) // пушим чувака по руту к диалогу с этим мужиком
    }


    // теперь надо понять, как мы будем понимать, кто может удалять смски, апдейтить и т.д.
    // т.е. нам надо получить какие-то константы

    const isAdmin = currentMember.role === MemberRole.ADMIN
    const isMod = currentMember.role === MemberRole.MODERATOR
    const isGuest = currentMember.role === MemberRole.GUEST

    const isOwner = currentMember.id === member.id // овнер смски может ее удалять и редачить, но другой уже не может (если не мод и не админ)

    const ableToDeleteMessage = !deleted && (isOwner || isAdmin || isMod)
    const ableToEditMessage = !isUpdated && isOwner && !fileUrl


    const fileType = fileUrl?.split('.').pop() // базовый трюк с получением расширения файла

    const isPDF = fileType === 'pdf' && fileUrl
    const isImage = !isPDF && fileUrl

    // такой метод создания 1000 правильно названных переменных на самом деле нормальный
    // просто в будущем не надо будет в коде писать много тернари
    // сразу упрощаем себе жизнь и пользуемся декларативным методом!
    // т.е. надо отрисовать мусорку рядом с смской, просто в тернари запишем уже переменные, а не все эти выражения

    // теперь надо думать как мы будем хендлить делит и едит
    // явно нужны какие-то модалки (типо делитсмс, едитсмс)
    // они кстати похожи на уже наши модалки => можно просто скопировать
    // но едитинг в дискорде происходит не так (не модалкой, а прям в ui)
    // т.е. появляется инпут с валью смски ui немного меняется добавляется кнопка сейв, в которую кинем patch реквест
    // + ниже инпута появляется описание , типо нажми энтер, чтобы внести изменения
    // т.е. это происходит не моментально, а у нас есть стейт, взависимости от которого нам надо будет менять ui
    // и + когда у нас стейт трушный, т.е. мы едитим смску, то появляются шорткаты, типо энтер и отправится (хотя мб это через тайп сабмит) и эскейп, чтобы отменить (это точно не через сабмит)
    // следовательно нам надо сделать стейт
    const [isEditing, setIsEditing] = useState(false)

    const { onOpen, isOpen, onClose, data, type } = useModal()

    const params = useParams()
    const router = useRouter()




    // если мы эдитем, то это форма
    // опять заюзаем shadcn
    // + так как это форма нужен зод и зодрезолвер


    // берем стейт лоадинга из формы 

    const isLoading = form.formState.isSubmitting

    // console.log(socketQuery)

    // создаем функция для сабмита эдита

    const onSubmit = async (values: any) => {
        try {
            const url = qs.stringifyUrl({
                url: `${socketUrl}/${id}`,
                query: socketQuery // прям красиво встанет, так как это объект уже и поля и все ой как хорошо
            })
            await axios.patch(url, values)

            form.reset()
            setIsEditing(false)
        } catch (error) {
            console.log(error)
        }
    }



    // теперь делаем keydown эвенты
    // как обычно через useEffect 

    useEffect(() => {
        const handleKeyDown = (e: any) => { // запихиваем это в функцию, т.к. надо отчищать! (не забывать)
            if (e.key === 'escape' || e.keyCode === 27) {
                setIsEditing(false)
            }
        }

        window.addEventListener('keydown', handleKeyDown) // добавляем этот слушатель

        return () => { // и отчистка
            window.removeEventListener('keydown', handleKeyDown)
        }

    }, [])


    return (
        <div className='group bg-transparent relative flex items-center hover:bg-black/5 w-full p-4'>
            <div className="flex flex-row items-center gap-2 group w-full">
                <div onClick={onMemberClick} className='cursor-pointer hover:drop-shadow-lg transition shadow-zinc-300'>
                    <UserAvatar image_url={member.profile.image_url} />
                </div>
                <div className='flex-1 flex flex-col justify-between h-full'>
                    <div className='flex flex-row gap-1 items-center'>
                        <p onClick={onMemberClick} className='text-white font-semibold text-md'>{member.profile.name}</p>
                        {/* {member.role === 'GUEST' && null}
                        {member.role === 'MODERATOR' && (<ActionTooltip label={member.role}><ShieldCheck className={'text-indigo-500 w-4 h-4'} /></ActionTooltip>)}
                        {member.role === 'ADMIN' && (<ActionTooltip label={member.role}><ShieldCheck className={'text-rose-500 w-4 h-4'} /></ActionTooltip>)} */}
                        {/* можно было бы сделать и так, но лучше мапой */}

                        <ActionTooltip label={member.role}>
                            {roleIconMap[member.role]}
                        </ActionTooltip> {/* это выглядит гораздо приятнее */}
                        <p className='text-xs text-zinc-500 dark:text-zinc-400'>{timestamp}</p>
                    </div>
                    {isImage && (
                        <a href={fileUrl} target='_blank' rel='noopener noreferrer' className='border relative rounded-md mt-2 overflow-hidden aspect-square flex items-center bg-black h-48 w-48'>
                            <Image src={fileUrl} alt='image' fill className='object-cover' />
                        </a>
                    )}
                    {isPDF && (
                        <div className="relative flex items-center p-2 mt-2 rounded-md bg-background/10">
                            <FileIcon className="h-10 w-10 fill-indigo-200 stroke-indigo-400" />
                            <a
                                href={fileUrl}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="ml-2 text-sm text-indigo-500 dark:text-indigo-400 hover:underline"
                            >
                                file
                            </a>

                        </div>
                    )}
                    {/* т.е. сразу рассматриваем 2 кейса */}
                    {/* смска может рендериться как параграф просто */}
                    {/* или если мы редактируем, то как параграф, со всеми вытекающими приколами */}

                    {
                        !isEditing && !fileUrl && (
                            <p className={cn(`text-zinc-600 dark:text-zinc-300 text-sm flex items-center`, deleted && 'italic dark:text-zinc-400 text-zinc-500 text-xs mt-1')}>
                                <div>{content}</div>
                                {isUpdated && !deleted && <span className='text-[10px] text-zinc-500 dark:text-zinc-400'>(edited)</span>}
                            </p>
                        )
                    }
                    {
                        isEditing && !fileUrl && (
                            <Form {...form}>
                                <form onSubmit={form.handleSubmit(onSubmit)} className='flex items-center w-full gap-2 flex-1'>
                                    <FormField
                                        control={form.control}
                                        name='content'
                                        render={({ field }) => (
                                            <FormItem className='flex-1'>
                                                <FormControl>
                                                    <div className='relative w-full'>
                                                        <Input disabled={isLoading} {...field} className='w-full border-none border-0 focus-visible:ring-0 ring-offset-0 focus-visible:ring-offset-0 dark:bg-zinc-700/60 text-zinc-600 dark:text-zinc-200' />
                                                    </div>
                                                </FormControl>

                                            </FormItem>
                                        )}

                                    />
                                    <Button className='' variant={'primary'} size={'sm'}>
                                        Save
                                    </Button>
                                </form>
                                <span className='text-xs text-zinc-500 dark:text-zinc-400'>escape to <button onClick={() => setIsEditing(false)} className='hover:underline cursor-pointer text-blue-500/90'>cancel</button> • <button className='hover:underline cursor-pointer text-blue-500/90'>enter</button> to save</span>
                            </Form>
                        )
                    }
                </div>

            </div>
            {/* если мы можем удалить смску (т.е. ableToDeleteMessage), то у нас будет всплывать мусорка при навидении на смску */}
            {/* для этого мы даем всей смске group свойство, и при group-hover и true значении выползет окошко */}
            {ableToDeleteMessage && <div className='gap-2 absolute hidden group-hover:flex items-center p-1 right-3 rounded-sm bg-white dark:bg-zinc-800 -top-2 text-md'>
                {ableToEditMessage && (
                    <ActionTooltip label='edit'>
                        <Edit onClick={() => setIsEditing(!isEditing)} className='ml-auto cursor-pointer w-5 h-5 text-zinc-400 dark:text-zinc-500 dark:hover:text-zinc-300 transition' />
                    </ActionTooltip>
                )}
                <ActionTooltip label='delete'>
                    <Trash onClick={() => onOpen('deleteMessage', { apiUrl: `${socketUrl}/${id}`, query: socketQuery })} className='cursor-pointer w-5 h-5 text-zinc-400 dark:text-zinc-500 dark:hover:text-zinc-300 transition' />
                </ActionTooltip>
            </div>}
        </div>
    )
}

export default ChatMessage