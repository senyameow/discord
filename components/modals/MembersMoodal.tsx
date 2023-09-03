'use client'
import React, { useEffect, useState } from 'react'
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuPortal,
    DropdownMenuSeparator,
    DropdownMenuSub,
    DropdownMenuSubContent,
    DropdownMenuSubTrigger,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"




import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
} from '../ui/dialog' // чтобы юзать окошко, нам понадобятся все эти штуки





import { useModal } from '../hooks/use-modal-store'
import { Label } from '../ui/label'
import { Input } from '../ui/input'
import { Button } from '../ui/button'
import { Check, Copy, Gavel, Loader2, MoreVertical, RefreshCw, Shield, ShieldAlert, ShieldCheck, ShieldQuestion } from 'lucide-react'
import { useInvite } from '../hooks/use-invite-link'
import axios from 'axios'
import { ScrollArea } from '../ui/scroll-area'
import UserAvatar from '../UserAvatar'
import { MemberRole } from '@prisma/client'
import qs from 'query-string'
import { ServerWithMembersWithProfiles } from '@/types'
import { useRouter } from 'next/navigation'

// создаем схему формы с помощью зода (крутая валидация)


// теперь просто берем и прокидываем нашу схему в форму с помощью резолвера


const roleIconMap = {
    'GUEST': null,
    'MODERATOR': <ShieldCheck className='w-4 h-4 text-indigo-600 ml-2' />,
    'ADMIN': <ShieldAlert className='w-4 h-4 ml-2 text-rose-600' />
}

export const MembersModal = () => {

    const [loadingId, setLoadingId] = useState('')




    const { isOpen, onClose, onOpen, type, data } = useModal()

    const { server } = data as { server: ServerWithMembersWithProfiles } // берем сервер из даты

    const isModalOpen = type === 'manage' && isOpen

    const router = useRouter()


    // как будем обновлять ссылку?


    const onKick = async (memberId: string) => {
        try {
            setLoadingId(memberId)
            const url = qs.stringifyUrl({
                url: `/api/members/kick/${memberId}`,
                query: {
                    serverId: server.id,
                }
            })
            const res = await axios.patch(url)

            router.refresh()
            onOpen('manage', { server: res.data })
        } catch (error) {
            console.log('KICK ERROR', error)
        } finally {
            setLoadingId('')
        }
    }


    const onRoleChange = async (memberId: string, role: MemberRole) => {
        try {
            setLoadingId(memberId)
            const url = qs.stringifyUrl({
                url: `/api/members/change/${memberId}`,
                query: {
                    serverId: server.id,
                    // memberId: memberId // на самом деле мы можем не слать мемберайди в квери т.к. он у нас в скобочках есть в руте
                }
            })
            const res = await axios.patch(url, { role })
            router.refresh() // обновили компоненты на ui 
            // теперь нам надо вернуть с репонса обратно уже обновленную дату!!!
            // т.е. открываем окошечко с обновленной датой
            onOpen('manage', { server: res.data }) // т.е. вот так



        } catch (error) {
            console.log(error)
        } finally {
            setLoadingId('')
        }
    }


    return (
        <Dialog open={isModalOpen} onOpenChange={onClose}> {/* сделаем его по дефолту открытым */}
            <DialogContent className='bg-white text-black overflow-hidden'>
                <DialogHeader className='pt-8 px-6 flex flex-col gap-3 items-center justify-center'>
                    <DialogTitle className='text-2xl font-bold text-center'>
                        Members of your server
                    </DialogTitle>

                    <DialogDescription className='text-center text-zinc-500'>
                        {server?.members.length} members
                    </DialogDescription>
                </DialogHeader>


                <ScrollArea className='max-h-[420px] mt-8 pr-6'>
                    {server?.members.map(member => (
                        <div key={server.id} className='flex flex-row items-center gap-2 mb-5 w-full]'>
                            <UserAvatar image_url={member.profile.image_url} className={`${member.role}`} />
                            <div className='flex flex-col items-center justify-between text-sm text-black'>
                                <div className='flex flex-row items-center w-full'>
                                    <div className='font-semibold'>{member.profile.name}</div>
                                    <div>
                                        {roleIconMap[member.role]} {/* очень просто вот атк находим нужный нам значок */}
                                    </div> {/* чтобы нормально отрисовывать значки, надо создать объект со всем возможными ролями и на каждую роль кинуть свою иконку */}
                                </div>
                                <div className='text-zinc-500'>
                                    {member.profile.email}
                                </div>
                            </div>
                            <div className='ml-auto place-self-end justify-self-end mr-4'>
                                {server.profileId !== member.profileId && loadingId !== member.id && (

                                    <DropdownMenu>
                                        <DropdownMenuTrigger>
                                            <MoreVertical className='h-4 w-4 text-zinc-500' />
                                        </DropdownMenuTrigger>
                                        <DropdownMenuContent side='left'>
                                            <DropdownMenuSub>
                                                <DropdownMenuSubTrigger className='flex items-center cursor-pointer'>
                                                    <ShieldQuestion className='h-4 w-4 mr-2' />
                                                    <span>role</span>
                                                </DropdownMenuSubTrigger>
                                                <DropdownMenuPortal>
                                                    <DropdownMenuSubContent>
                                                        <DropdownMenuItem onClick={() => onRoleChange(member.id, 'GUEST')}>
                                                            <Shield className='w-4 h-4 mr-2' />
                                                            guest
                                                            {member.role === 'GUEST' && (
                                                                <Check className='w-5 h-5 ml-auto' />
                                                            )}
                                                        </DropdownMenuItem>
                                                        <DropdownMenuItem onClick={() => onRoleChange(member.id, 'MODERATOR')}>
                                                            <ShieldCheck className='w-4 h-4 mr-2' />
                                                            moderator
                                                            {member.role === 'MODERATOR' && (
                                                                <Check className='w-5 h-5 ml-auto' />
                                                            )}
                                                        </DropdownMenuItem>
                                                    </DropdownMenuSubContent>
                                                </DropdownMenuPortal>
                                            </DropdownMenuSub>
                                            <DropdownMenuSeparator />
                                            <DropdownMenuItem className='' onClick={() => onKick(member.id)}>
                                                <Gavel className='w-4 h-4 mr-2' />
                                                kick
                                            </DropdownMenuItem>
                                        </DropdownMenuContent>
                                    </DropdownMenu>
                                )}
                            </div>
                            {(loadingId === member.id) && (
                                <Loader2 className='animate-spin text-zinc-500 ml-2' />
                            )}
                        </div>
                    ))}
                </ScrollArea>

            </DialogContent>
        </Dialog>
    )
}