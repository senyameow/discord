'use client'
import React, { useEffect, useState } from 'react'

import * as z from 'zod'
import { zodResolver } from '@hookform/resolvers/zod'


import {
    Dialog,
    DialogContent,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from '../ui/dialog' // чтобы юзать окошко, нам понадобятся все эти штуки


import {
    Form,
    FormControl,
    FormField,
    FormItem,
    FormLabel,
    FormMessage
} from '@/components/ui/form' // понадобится для создания формы

import axios from 'axios';


import { useForm } from 'react-hook-form'
import { Input } from '../ui/input'
import { Button } from '../ui/button'
import { useParams, useRouter } from 'next/navigation'
import { useModal } from '../hooks/use-modal-store'
import { ChannelType } from '@prisma/client'
import qs from 'query-string'

import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select"
import { ServerWithMembersWithProfiles } from '@/types'


// создаем схему формы с помощью зода (крутая валидация)

const formSchema = z.object({
    name: z.string().min(1, {
        message: 'channel name is required!'
    }).max(10, {
        message: 'channel name should contain less than 10 characters'
    }).refine(
        name => name !== "general",
        {
            message: "Channel name cannot be 'general'"
        }
    ),
    type: z.nativeEnum(ChannelType)
})
// теперь просто берем и прокидываем нашу схему в форму с помощью резолвера


export const EditChannelModal = () => {

    const router = useRouter()
    const params = useParams();


    const { isOpen, onClose, onOpen, type, data } = useModal()

    const { channelType } = data

    const { channel, server } = data


    const isModalOpen = isOpen && type === 'editChannel' // такая проверка, когда много типов модалок
    // если просто указать isOpen, то при открытии другой модалки, стейт isOpen будет true и откроются другие

    // напоминаю себе, что эта штука будет рендериться, если у юзера, который зарегался еще нет серваков

    // модалки вызыват гидрацию, поэтому с помозью стейта и эффекта избавляемся от этих ошибок



    const form = useForm({
        resolver: zodResolver(formSchema), // теперь форма должна соответствовать правилам описанным в formSchema
        defaultValues: {
            name: '',
            type: channel?.type || ChannelType.TEXT
        }

    }) // совмещение useForm + zod + zodResolver дает очень сильную связку в валидации форм

    useEffect(() => {
        if (channel) {
            form.setValue('name', channel.name)
            form.setValue('type', channel.type)
        }


    }, [form, channelType, channel])

    const isLoading = form.formState.isSubmitting
    // еще классная штука, то что мы можем без всяуих экспериментальных хуков забрать лоадинг стейт 

    // и делаем онсабмит функцию

    const onSubmit = async (values: z.infer<typeof formSchema>) => { // пользуемся инфером (чтобы получить тип данных для формы)
        // console.log(values)

        // нам надо отправаить нашу форму на сервер (заюзаем дефолтный аксиос)

        try {
            const url = qs.stringifyUrl({
                url: `/api/channels/${channel?.id}`,
                query: {
                    serverId: server?.id
                }
            })
            await axios.patch(url, values)
            form.reset()
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




    return (
        <Dialog open={isModalOpen} onOpenChange={onChange}> {/* сделаем его по дефолту открытым */}
            <DialogContent className='bg-white text-black p-0 overflow-hidden'>
                <DialogHeader className='pt-8 px-6 flex flex-col gap-3 items-center justify-center'>
                    <DialogTitle className='text-2xl font-bold text-center'>
                        Edit channel
                    </DialogTitle>

                </DialogHeader>
                <Form {...form}>
                    <form onSubmit={form.handleSubmit(onSubmit)} className='space-y-8'>
                        <div className='space-y-8 px-6'>


                            <FormField
                                control={form.control}
                                name='name'
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel className='uppercase text-xs font-bold text-zink-500 dark:text-secondary/70'>channel name</FormLabel>
                                        <FormControl>
                                            <Input disabled={isLoading} placeholder="enter channel name" className='border-0 focus-visible:ring-0 text-black outline-none bg-zinc-300/50 focus-visible:ring-offset-0' {...field} />
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />
                            <FormField
                                control={form.control}
                                name='type'
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Email</FormLabel>
                                        <Select disabled={isLoading} onValueChange={field.onChange} defaultValue={field.value}>
                                            <FormControl>
                                                <SelectTrigger className='bg-zinc-200/70 border-0 focus:ring-0 text-black focus:ring-offset-0'>
                                                    <SelectValue placeholder="Select a channel type" />
                                                </SelectTrigger>
                                            </FormControl>
                                            <SelectContent>
                                                {Object.values(ChannelType).map(type => (
                                                    <SelectItem key={type} value={type}>{type.toLowerCase()}</SelectItem>
                                                ))}
                                            </SelectContent>
                                        </Select>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />
                        </div>
                        <DialogFooter className='px-6 py-4 bg-gray-100 flex items-end place-items-end'>
                            <Button disabled={isLoading} variant={'primary'}>
                                Create
                            </Button>
                        </DialogFooter>
                    </form>

                </Form>
            </DialogContent>
        </Dialog>
    )
}