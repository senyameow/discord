'use client'
import React, { useEffect, useState } from 'react'


import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from '../ui/dialog' // чтобы юзать окошко, нам понадобятся все эти штуки





import { useModal } from '../hooks/use-modal-store'
import { Label } from '../ui/label'
import { Input } from '../ui/input'
import { Button } from '../ui/button'
import { Check, Copy, RefreshCw } from 'lucide-react'
import axios from 'axios'
import { db } from '@/lib/db'
import { useRouter } from 'next/navigation'

// создаем схему формы с помощью зода (крутая валидация)


// теперь просто берем и прокидываем нашу схему в форму с помощью резолвера


export const LeaveModal = () => {

    const [isLoading, setIsLoading] = useState(false)

    const router = useRouter()


    const { isOpen, onClose, onOpen, type, data } = useModal()

    const { server } = data // берем сервер из даты

    const isModalOpen = type === 'leaveServer' && isOpen



    const onLeave = async () => {
        try {
            setIsLoading(true)
            const res = await axios.patch(`/api/servers/${server?.id}/leave`)

            onClose() // закрыли модалку
            router.refresh() // зарефрешили ui
            router.push('/') // кинули юзера на базу



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
                        Leave Server
                    </DialogTitle>
                    <DialogDescription>
                        Are You Sure You Want To Leave {` `} <span> </span>
                        <span className='text-indigo-500 font-semibold'>{server?.name}</span>
                    </DialogDescription>

                </DialogHeader>

                <DialogFooter className='w-full  bg-gray-100 px-6 py-4'>
                    <div className='flex flex-row justify-between items-center w-full'>
                        <Button onClick={onClose} className='bg-transparent hover:bg-transparent'>
                            Cancel
                        </Button>
                        <Button disabled={isLoading} onClick={onLeave} className='text-white hover:text-white hover:bg-indigo-500/90 font-bold bg-indigo-500'>
                            Leave
                        </Button>
                    </div>
                </DialogFooter>

            </DialogContent>
        </Dialog>
    )
}