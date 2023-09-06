'use client'
import React, { useEffect, useState } from 'react'

import * as z from 'zod'
import { zodResolver } from '@hookform/resolvers/zod'


import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from '../ui/dialog' // чтобы юзать окошко, нам понадобятся все эти штуки


import {
    Form,
    FormControl,
    FormDescription,
    FormField,
    FormItem,
    FormLabel,
    FormMessage
} from '@/components/ui/form' // понадобится для создания формы

import axios from 'axios';


import { useForm } from 'react-hook-form'
import { Input } from '../ui/input'
import { Button } from '../ui/button'
import FileUpload from '../FileUpload'
import { useRouter } from 'next/navigation'
import { useModal } from '../hooks/use-modal-store'

import qs from 'query-string'

// создаем схему формы с помощью зода (крутая валидация)

const formSchema = z.object({

    fileUrl: z.string().min(1, ' ')
})
// теперь просто берем и прокидываем нашу схему в форму с помощью резолвера


export const MessageFileModal = () => {

    const { isOpen, onOpen, onClose, data, type } = useModal()

    const { apiUrl, query } = data // нам нужны эти штуки, чтобы знать куда постить смску, поэтому как бы модалка одна,
    // но она должна хендлить много случаев, т.е. открываю ее на одном серваке и туда прилетают одни значения для квери
    // перехожу на другой прилетают другие значения квери
    // тем самым просто в модалсторе делаем еще 2 поля, где будем хранить те значения
    // здесь просто их забираем и делаем правильный запрос на правильный сервер и канал!

    const isModalOpen = type === 'messageFile' && isOpen

    const router = useRouter()

    // напоминаю себе, что эта штука будет рендериться, если у юзера, который зарегался еще нет серваков

    // модалки вызыват гидрацию, поэтому с помозью стейта и эффекта избавляемся от этих ошибок


    const form = useForm({
        resolver: zodResolver(formSchema), // теперь форма должна соответствовать правилам описанным в formSchema
        defaultValues: {
            fileUrl: '',
        }
    })


    const isLoading = form.formState.isSubmitting


    const onSubmit = async (values: z.infer<typeof formSchema>) => {


        try {

            const url = qs.stringifyUrl({
                url: apiUrl as string || '',
                query
            })

            await axios.post(url, {
                ...values,
                content: values.fileUrl
            })

            form.reset()
            router.refresh()
            handleClose()

        } catch (error) {
            console.log(error)
        }

    }

    const handleClose = () => {
        form.reset()
        onClose()
    }



    return (
        <Dialog open={isModalOpen} onOpenChange={handleClose}> {/* сделаем его по дефолту открытым */}
            <DialogContent className='bg-white text-black p-0 overflow-hidden'>
                <DialogHeader className='pt-8 px-6 flex flex-col gap-3 items-center justify-center'>
                    <DialogTitle className='text-2xl font-bold text-center'>
                        Add an attachment
                    </DialogTitle>
                    <DialogDescription className='text-[16px] text-zinc-500 text-center'>
                        Send an image or pdf file
                    </DialogDescription>
                </DialogHeader>
                <Form {...form}>
                    <form onSubmit={form.handleSubmit(onSubmit)} className='space-y-8'>
                        <div className='space-y-8 px-6'>
                            <div className='flex items-center justify-center text-center'> {/* для загрузки картинок классная штука есть - uploadThing */}
                                <FormField
                                    control={form.control}
                                    name='fileUrl'
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormControl>
                                                <FileUpload
                                                    endpoint='messageFile'
                                                    value={field.value}
                                                    onChange={field.onChange}
                                                />
                                            </FormControl>
                                        </FormItem>
                                    )}
                                />
                            </div>


                        </div>
                        <DialogFooter className='px-6 py-4 bg-gray-100 flex items-end place-items-end'>
                            <Button disabled={isLoading} variant={'primary'}>
                                Send
                            </Button>
                        </DialogFooter>
                    </form>

                </Form>
            </DialogContent>
        </Dialog>
    )
}