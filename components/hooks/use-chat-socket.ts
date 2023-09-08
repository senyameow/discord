// здесь мы будем совершать действия сервер клиент / клиент сервер

import { hashQueryKey, useQueryClient } from "@tanstack/react-query";
import { useSocket } from "../providers/SocketProvider";
import { useEffect } from "react";
import { Member, Message, Profile } from "@prisma/client";

type ChatSocketProps = {
    addKey: string;
    updateKey: string;
    queryKey: string;
}

type MessageWithMemberWithProfile = Message & {
    member: Member & {
        profile: Profile
    }
}

export const useChatSocket = ({ addKey, updateKey, queryKey }: ChatSocketProps) => {

    console.log(updateKey)
    const { socket } = useSocket()
    const queryClient = useQueryClient()

    useEffect(() => {
        if (!socket) return // если нет сокета, то просто ретерн
        // что делаем если есть сокет? 
        // надо все обработчики записать

        // апдейт

        socket.on(updateKey, (message: MessageWithMemberWithProfile) => {
            queryClient.setQueryData([queryKey], (oldData: any) => {
                // if (!oldData || !oldData.pages || )
                // переписываем дату в ключ
                const newData = oldData.pages.map((page: any) => { // проходимся по всем страницам
                    return {
                        ...page, // все что было остается
                        items: page.items.map((item: MessageWithMemberWithProfile) => { // а вот если в айтемах айдишник совпадает с айдишником смски
                            // то это значит, что мы нашли ту смску, которую меняли
                            // ее и возвращаем!
                            if (item.id === message.id) return message
                            return item // а все остальные айтемы остаются на своих местах
                        })
                    }
                })
                return {
                    ...oldData,
                    pages: newData
                }
            }) // весь этот процесс для того, чтобы заменить старую дату на новую, просто это немного страшновато выглядит
        })

        socket.on(addKey, (message: MessageWithMemberWithProfile) => {
            // console.log(message)
            // console.log(queryClient.getQueryData([queryKey])) // так мне возвращает объект с pages и pageParams
            // в pages лежит объект из одного элемента (хз пока так) 
            // в нем объект с полями items и nextCursor
            // items - список объектов (той даты, которую мы передавали, т.е. message)
            // т.е. чтобы добавить новый айтем нам надо
            // нам надо оставить всю прошлую дату, т.е. все айтемы, но к ним добавить еще новый
            // поэтому в колбэк кидаем oldData
            // НАМ НАДО ВЕРНУТЬ ПОД ЭТОТ КЛЮЧ СПИСОК ОБЪЕКТОВ ПОД НАЗВАНИЕМ pages
            // просто надо сделать правильно
            queryClient.setQueryData([queryKey], (oldData: any) => {
                // console.log(oldData)
                if (!oldData || !oldData.pages || oldData.pages.length === 0) {
                    return {
                        pages: [
                            { items: [message] } // если нет смсок, то просто пропихиваем в pages правильно эту смску
                            // просто по логу посмотреть какие типы данных и как там все утроено и пропихнуть
                        ]
                    }
                }
                const newData = [...oldData.pages]

                newData[0] = {
                    ...newData[0], // нексткурсор чтобы не пропал
                    items: [message, ...newData[0].items] // и в айтемс (список) закинуть новое сообщение наверх
                }

                return {
                    ...oldData,
                    pages: newData // и не забываем возвращать эту штуку!
                    // тем самым получая ее на странице!
                }

            })

        })

        return () => {
            socket.off(updateKey)
            socket.off(addKey)
        } // и отчистили
    }, [queryClient, queryKey, socket, updateKey, addKey]) // в депенденси эрэй запихали все по канону
}
// ОТЛИЧНО!!!! ТЕПЕРЬ У МЕНЯ ПОД КЛЮЧОМ ЧАТА ЛЕЖИТ ОБЪЕКТ СО СТРАНИЦАМИ, И Я МОГУ ИХ ПО ЛУ ЧАТЬ В РЕАЛТАЙМЕ

