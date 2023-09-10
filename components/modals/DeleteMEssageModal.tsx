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

import qs from 'query-string'



import { useModal } from '../hooks/use-modal-store'
import { Label } from '../ui/label'
import { Input } from '../ui/input'
import { Button } from '../ui/button'
import { Check, Copy, RefreshCw } from 'lucide-react'
import axios from 'axios'
import { db } from '@/lib/db'
import { useParams, useRouter } from 'next/navigation'
import { ServerWithMembersWithProfiles } from '@/types'

// создаем схему формы с помощью зода (крутая валидация)


// теперь просто берем и прокидываем нашу схему в форму с помощью резолвера


export const DeleteMEssageModal = () => {

    const [isLoading, setIsLoading] = useState(false)

    const router = useRouter()
    const params = useParams()


    const { isOpen, onClose, onOpen, type, data } = useModal()

    const { server, channel } = data // берем сервер из даты

    const isModalOpen = type === 'deleteMessage' && isOpen

    const { apiUrl, query } = data



    const onDelete = async () => {
        try {
            setIsLoading(true)
            // мне надо и сервер айди и канал айди, т.е. много всего надо, просто через парамсы будет сложно
            // следовательно проще заюзать qs
            const url = qs.stringifyUrl({
                url: apiUrl as string,
                query: query
            })
            await axios.delete(url)

            onClose() // закрыли модалку
            router.refresh() // зарефрешили ui



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
                        Delete Message
                    </DialogTitle>
                    <DialogDescription>
                        Are You Sure You Want To Delete {` `} <span> </span>
                        <span>the message will be deleted</span>
                    </DialogDescription>

                </DialogHeader>

                <DialogFooter className='w-full  bg-gray-100 px-6 py-4'>
                    <div className='flex flex-row justify-between items-center w-full'>
                        <Button onClick={onClose} className='bg-transparent hover:bg-transparent'>
                            Cancel
                        </Button>
                        <Button disabled={isLoading} onClick={onDelete} className='text-white hover:text-white hover:bg-indigo-500/90 font-bold bg-indigo-500'>
                            Delete
                        </Button>
                    </div>
                </DialogFooter>

            </DialogContent>
        </Dialog>
    )
}