'use client'
import React, { useEffect, useState } from 'react'


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
import { Check, Copy, RefreshCw } from 'lucide-react'
import { useInvite } from '../hooks/use-invite-link'
import axios from 'axios'

// создаем схему формы с помощью зода (крутая валидация)


// теперь просто берем и прокидываем нашу схему в форму с помощью резолвера


export const InviteModal = () => {

    const [isLoading, setIsLoading] = useState(false)
    const [isCopied, setIsCopied] = useState(false)


    const { isOpen, onClose, onOpen, type, data } = useModal()

    const { server } = data // берем сервер из даты

    const isModalOpen = type === 'invite' && isOpen

    const origin = useInvite()

    const link = `${origin}/invite/${data.server?.invite_code}` // вот такие мутки можно мутить - создадим раут инвайт и там будем хендлить инвайты

    const onCopy = () => {
        navigator.clipboard.writeText(link) // вот так можно копировать 
        setIsCopied(true)

        setTimeout(() => {
            setIsCopied(false)
        }, 1500);
    }

    // как будем обновлять ссылку?

    const onNew = async () => {
        try {
            setIsLoading(true)
            const response = await axios.patch(`/api/servers/${server?.id}/invite-code`) // с помощью патча будем апдейтить сервер
            // но ссылка сама по себе не появится, поэтому надо заново открыть окно, уже с обновленной датой
            onOpen('invite', { server: response.data })
        } catch (error) {
            console.log(error)
        } finally {
            setIsLoading(false)
        }

    }


    return (
        <Dialog open={isModalOpen} onOpenChange={onClose}> {/* сделаем его по дефолту открытым */}
            <DialogContent className='bg-white text-black p-0 overflow-hidden'>
                <DialogHeader className='pt-8 px-6 flex flex-col gap-3 items-center justify-center'>
                    <DialogTitle className='text-2xl font-bold text-center'>
                        Invite Friends!
                    </DialogTitle>

                </DialogHeader>

                <div className='p-6'>
                    <Label className='uppercase text-zinc-500 text-xs font-bold dark:text-secondary/70'>
                        Server invite link
                    </Label>
                    <div className='flex items-center mt-2 gap-2'>
                        <Input disabled={isLoading} className='bg-zink-300/50 border-0 bg-neutral-200 focus-visible:ring-offset-0 focus-visible:ring-0 text-black' value={link} />
                        <Button disabled={isLoading} onClick={onCopy}>
                            {isCopied ? <Check className='w-4 h-4' size={'icon'} /> : <Copy className='w-4 h-4' size={'icon'} />}
                        </Button>
                    </div>
                    <Button onClick={onNew} disabled={isLoading} className='mt-2 text-zink-500 text-xs' variant={'link'}>
                        generate a new link
                        <RefreshCw className='text-zink-500 w-4 h-4 ml-2' />
                    </Button>
                </div>

            </DialogContent>
        </Dialog>
    )
}