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

// создаем схему формы с помощью зода (крутая валидация)

const formSchema = z.object({
    name: z.string().min(3, {
        message: 'server name is required!'
    }),
    image_url: z.string().min(1, {
        message: 'server image is required!'
    })
})
// теперь просто берем и прокидываем нашу схему в форму с помощью резолвера


export const EditServerModal = () => {

    const router = useRouter()

    const { isOpen, onClose, onOpen, type, data } = useModal()

    const isModalOpen = isOpen && type === 'editServer' // такая проверка, когда много типов модалок
    // если просто указать isOpen, то при открытии другой модалки, стейт isOpen будет true и откроются другие

    // напоминаю себе, что эта штука будет рендериться, если у юзера, который зарегался еще нет серваков

    // модалки вызыват гидрацию, поэтому с помозью стейта и эффекта избавляемся от этих ошибок

    const { server } = data





    const form = useForm({
        resolver: zodResolver(formSchema), // теперь форма должна соответствовать правилам описанным в formSchema
        defaultValues: {
            name: '',
            image_url: '',
        }
    }) // совмещение useForm + zod + zodResolver дает очень сильную связку в валидации форм


    const isLoading = form.formState.isSubmitting
    // еще классная штука, то что мы можем без всяуих экспериментальных хуков забрать лоадинг стейт 

    // и делаем онсабмит функцию

    const onSubmit = async (values: z.infer<typeof formSchema>) => { // пользуемся инфером (чтобы получить тип данных для формы)
        // console.log(values)

        // нам надо отправаить нашу форму на сервер (заюзаем дефолтный аксиос)

        try {
            await axios.patch(`/api/servers/${server?.id}`, values) // эдит с помощью патча!
            router.refresh()
            onClose()


        } catch (error) {
            console.log(error)
        }

    }

    const onChange = () => {
        form.reset()
        onClose()
    } // нужна кастомная onChange, которая будет закрвать модалку (просто отччистка и просто onClose)


    useEffect(() => {
        if (server) {
            form.setValue('name', server.name);
            form.setValue('image_url', server.image_url);
        } // вот так можно реализовывать едитинг формы (т.е. открывается модалка, и когда она загрузилась там уже в полях есть предыдущие значения)
    }, [])

    return (
        <Dialog open={isModalOpen} onOpenChange={onChange}> {/* сделаем его по дефолту открытым */}
            <DialogContent className='bg-white text-black p-0 overflow-hidden'>
                <DialogHeader className='pt-8 px-6 flex flex-col gap-3 items-center justify-center'>
                    <DialogTitle className='text-2xl font-bold text-center'>
                        Update your server
                    </DialogTitle>

                </DialogHeader>
                <Form {...form}>
                    <form onSubmit={form.handleSubmit(onSubmit)} className='space-y-8'>
                        <div className='space-y-8 px-6'>
                            <div className='flex items-center justify-center text-center'> {/* для загрузки картинок классная штука есть - uploadThing */}
                                <FormField
                                    control={form.control}
                                    name='image_url'
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormControl>
                                                <FileUpload
                                                    endpoint='serverImage'
                                                    value={field.value}
                                                    onChange={field.onChange}
                                                />
                                            </FormControl>
                                        </FormItem>
                                    )}
                                />
                            </div>

                            <FormField
                                control={form.control}
                                name='name'
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel className='uppercase text-xs font-bold text-zink-500 dark:text-secondary/70'>server name</FormLabel>
                                        <FormControl>
                                            <Input disabled={isLoading} placeholder="change your server name" className='border-0 focus-visible:ring-0 text-black outline-none bg-zinc-300/50 focus-visible:ring-offset-0' {...field} />
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />
                        </div>
                        <DialogFooter className='px-6 py-4 bg-gray-100 flex items-end place-items-end'>
                            <Button disabled={isLoading} variant={'primary'}>
                                Save
                            </Button>
                        </DialogFooter>
                    </form>

                </Form>
            </DialogContent>
        </Dialog>
    )
}