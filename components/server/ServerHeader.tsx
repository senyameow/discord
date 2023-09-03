'use client'
import React from 'react'
import { ServerWithMembersWithProfiles } from '@/types'
import { MemberRole } from '@prisma/client';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuTrigger } from '../ui/dropdown-menu';
import { ChevronDown, LogOut, PlusCircle, Settings, Trash, UserPlus, Users } from 'lucide-react';
import { useModal } from '../hooks/use-modal-store';

interface ServerHeaderProps {
    // но как создать тип для сервера???
    // для этого мы создаем отдельный файлик тайпс.тс 
    server: ServerWithMembersWithProfiles;
    role?: MemberRole
}

const ServerHeader = ({ server, role }: ServerHeaderProps) => {

    console.log(role, 'role')

    const isAdmin = role === MemberRole.ADMIN
    const isMod = isAdmin || role === MemberRole.MODERATOR

    const { onOpen } = useModal()

    return (
        <DropdownMenu>
            <DropdownMenuTrigger asChild className='focus:outline-none'>
                <button className='w-full text-md flex px-3 items-center h-12 justify-between border-neutral-200 dark:border-neutral-800 border-b-2 hover:bg-zinc-700/10 dark:hover:bg-zinc-700/50 transition'>
                    {server.name}
                    <ChevronDown size={20} />
                </button>
            </DropdownMenuTrigger>
            <DropdownMenuContent className='w-56 text-black dark:text-neutral-400 space-y-[2px] font-medium'>
                {isMod && (
                    <DropdownMenuItem onClick={() => onOpen('invite', { server })} className='cursor-pointer flex justify-between w-full text-indigo-600 dark:text-indigo-400'>
                        <span>Invite Prople</span>
                        <UserPlus />

                    </DropdownMenuItem>
                )}
                {isMod && (
                    <DropdownMenuItem onClick={() => onOpen('editServer', { server })} className='cursor-pointer flex justify-between w-full text-neutral-600 dark:text-neutral-400'>
                        <span>Server Settings</span>
                        <Settings size={20} />

                    </DropdownMenuItem>
                )}
                {isMod && (
                    <DropdownMenuItem onClick={() => onOpen('manage', { server })} className='cursor-pointer flex justify-between w-full text-lime-600 dark:text-lime-400'>
                        <span>Manage Members</span>
                        <Users size={20} />

                    </DropdownMenuItem>
                )}
                {isMod && (
                    <DropdownMenuItem onClick={() => onOpen('createChannel', { server })} className='cursor-pointer flex justify-between w-full text-black dark:text-white'>
                        <span>Create Channel</span>
                        <PlusCircle />

                    </DropdownMenuItem>
                )}
                {isAdmin && (
                    <DropdownMenuItem onClick={() => onOpen('deleteServer', { server })} className='text-rose-500 flex items-center cursor-pointer justify-between font-semibold'>
                        <span>Delete Server</span>
                        <Trash size={20} />
                    </DropdownMenuItem>
                )}
                {!isMod && <DropdownMenuItem onClick={() => onOpen('leaveServer', { server })} className='cursor-pointer flex justify-between text-red-500'>
                    <span>Leave the Server</span>
                    <LogOut size={20} />

                </DropdownMenuItem>}
            </DropdownMenuContent>
        </DropdownMenu>

    )
}

export default ServerHeader