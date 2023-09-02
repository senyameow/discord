'use client'
import React from 'react'
import { useParams, useRouter } from 'next/navigation'
import { ActionTooltip } from './action-tooltip'
import Image from 'next/image'
import { cn } from '@/lib/utils'

interface NavItemProps {
    id: string;
    image_url: string;
    name: string;

}

// здесь юзаем тултип, который мы уже сделали (будем выводить имя сервака)

export const NavItem = ({ id, image_url, name }: NavItemProps) => {

    const params = useParams() // с помощью этого хука достаем строчку из юрла, айди достается по тому руту в скобочках []
    const router = useRouter() // раутером будем переходить на другой сервер

    // у дса есть такая штука, что наводишься на сервак или фокусишься и раздвигается полоска
    // прокинули в навайтем айдишник сервера и с помощью него делаем анимации с этой полоской

    // надо сделать навайтем (как?)
    // оборачиваем все в actiontooltip для поп апа
    // прокидываем дефолтную кнопку, даем ей груп (для хавер эффектов) и даем релатив (так надо с груп + будут абсолют элементы)
    // внутри кидаем селф клоузинг див (полосочку слева) анимацию с помощью утилки cn делаем очень легко
    // и дальше кидаем еще один див в котором уже будет фотка сервака
    // опять юзаем cn для раундед эффекта

    const onClick = () => { // просто с помощью раутера пушем на тот сервак
        router.push(`/servers/${id}`) // т.к. в каждый навайтем мы прокидываем айдишник сервака, то мы можем этим воспользоваться
    }

    return (
        <ActionTooltip label={name} align='center' side='right'>
            <button className='group relative flex items-center justify-center w-full mb-3' onClick={onClick}>
                <div className={cn(`absolute left-0 w-[4px] bg-primary rounded-r-full transition-all`,
                    params?.serverId !== id && 'group-hover:h-[20px]',
                    params?.serverId === id ? 'h-[36px]' : 'h-[8px]')} />

                <div className={cn(`relative group flex items-center justify-center w-[48px] h-[48px] group-hover:rounded-[16px] rounded-[12px] overflow-hidden transition-all`,
                    params?.serverId === id && 'bg-primary/10 text-primary rounded-[20px]')}>
                    <Image fill src={image_url} alt='server' />
                </div>

            </button>
        </ActionTooltip>
    )
}