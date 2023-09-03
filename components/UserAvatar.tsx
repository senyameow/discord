import React from 'react'
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { cn } from '@/lib/utils'

// опять будем юзать cn, потому что нам нужно будет добавлять какие-то эффекты на аватар взависимости от роли участника

const UserAvatar = ({ image_url, className }: { image_url: string, className?: string }) => {
    return (
        <Avatar className={cn('w-7 h-7 md:h-10 md:w-10', className)}>
            <AvatarImage src={image_url} />
        </Avatar>
    )
}

export default UserAvatar