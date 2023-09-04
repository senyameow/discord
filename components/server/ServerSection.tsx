'use client'
import { ServerWithMembersWithProfiles } from '@/types';
import { ChannelType, MemberRole } from '@prisma/client';
import React from 'react'
import { ActionTooltip } from '../navigation/action-tooltip';
import { Plus, Settings } from 'lucide-react';
import { useModal } from '../hooks/use-modal-store';

// происходит похожая ситуация с ServerSearch
// нужно создать отдельные группки (текстовые каналы, аудио / видео) + участники
// т.е. мы прокидываем группки
// например label = 'text channels'
// в эту группку мы прокидываем прокидываем все зафетченные уже текст каналы, который прилетят пропсом с ServerSidebar
// и просто по группкам выводим в скроллэрию группы каналов
// также надо прокинуть тип для каждого канала, потому что мы будем рендерить разные иконки, для разных типов
// и также сам функционал канала зависит от его типа
// естественно нам нужен айдишник канала, чтобы онкликом пушить чувака по айдишнику канала динамически

// для мемберов, надо прокинуть мемберов, которых мы уже зафетчили с дбшки => просто как пропс закинем не проблема
// и просто сделать хорошую отрисовку для каждого канала
// вообщем все я думаю

interface ServerSectionProps {
    label: string;
    sectionType: 'members' | 'channels';
    channelType?: ChannelType;
    role?: MemberRole;

}

const ServerSection = ({ label, sectionType, channelType, role }: ServerSectionProps) => {

    const { onOpen } = useModal()

    return (
        <div className='flex items-center justify-between py-2'>
            <p className='uppercase text-zinc-500 dark:text-zinc-400 text-xs'>
                {label}
            </p> {/* тут встает другая задача, взависимости от роли мы должны рендерить каналы по-разному */}
            {/* т.е как видит обычный юзер и админ то 2 разные вещи по идее */}
            {/* но на самом деле, админ или мод просто видят еще плюсик около названия */}
            {(role !== 'GUEST' && role === 'ADMIN' && sectionType === 'channels') && < ActionTooltip label='Create Channel'>
                <button onClick={() => onOpen('createChannel', { channelType })}>
                    <Plus className='w-4 h-4 dark:hover:text-zinc-300 dark:text-zinc-400 transition' />
                </button>
            </ActionTooltip>}
            {/* {(role === 'ADMIN' && sectionType === 'channels') && (
                < ActionTooltip label='Create Channel'>
                    <button onClick={() => onOpen('members', { server })}>
                        <Settings className='w-4 h-4 dark:hover:text-zinc-300 dark:text-zinc-400 transition' />
                    </button>
                </ActionTooltip>
            )} */}

        </div >
    )
}

export default ServerSection