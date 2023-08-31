'use client'
import React from 'react'
import { Form } from '../ui/form'

import * as z from 'zod'
import { zodResolver } from '@hookform/resolvers/zod'

import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from '../../components/ui/dialog' // чтобы юзать окошко, нам понадобятся все эти штуки
import { useForm } from 'react-hook-form'



export const InitialModal = () => {
    // напоминаю себе, что эта штука будет рендериться, если у юзера, который зарегался еще нет серваков

    const form = useForm({
        defaultValues: {
            name: '',
            image_url: '',
        }
    }) // совмещение useForm + zod + zodResolver дает очень сильную связку в валидации форм

    return (
        <Dialog open> {/* сделаем его по дефолту открытым */}
            <DialogContent className='bg-white text-black p-0 overflow-hidden'>
                <DialogHeader className='pt-8 px-6 flex flex-col gap-3 items-center justify-center'>
                    <DialogTitle className='text-2xl font-bold text-center'>
                        Create your server
                    </DialogTitle>
                    <DialogDescription className='text-[16px] text-zinc-500 text-center'>
                        Give your new server a personality with a name and
                        an icon. You can always change it later.
                    </DialogDescription>
                </DialogHeader>
            </DialogContent>
        </Dialog>
    )
}