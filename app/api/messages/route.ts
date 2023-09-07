

// смски мы можем фетчить и через апишку (хз как это работает, но повезло!)

import { currentProfile } from "@/lib/current-profile"
import { db } from "@/lib/db"
import { Message } from "@prisma/client"
import { NextResponse } from "next/server"

const MESSAGES_BATCH = 10

export async function GET(req: Request) {
    try {

        const profile = await currentProfile() // и здесь соответсвенно юзаем обычный метод с профилем

        const { searchParams } = new URL(req.url)

        // забираем из квери все, что передавали
        // курсор для скрола
        // айди канала для фетча естественно

        const cursor = searchParams.get('cursor')
        const channelId = searchParams.get('channelId')

        if (!profile) return new NextResponse('Unauthorized', { status: 400 })
        if (!channelId) return new NextResponse('no channel id provided', { status: 400 })

        // теперь самое интересное!
        // как мы фетчим смски по несколько штук, да еще чтобы потом прогружались по скроллу

        // 1. устанавливаем сколько смсок надо пролистать
        // 2. задать let переменную для списка смсок

        let messages: Message[] = [] // ничего пока туда не кладем

        // 3. проверка по курсору

        if (cursor) {
            messages = await db.message.findMany({
                take: MESSAGES_BATCH, // вот на этой строчке завязывается прикол, т.е. берем определенное кол-ва строчек,
                skip: 1, // не хотим повторять одно и то же сообщение,
                cursor: {
                    id: cursor // и даем cursor (это уже встроено в призму) и кидаем туда айдишник просто
                },
                where: {
                    channelId
                },
                include: {
                    member: {
                        include: {
                            profile: true
                        }
                    } // т.к. нам нужны аватарки и имена, то включаем member, и профили этих чуваков
                    // т.е. он берет из этих строчек
                },
                orderBy: {
                    created_At: 'desc' // тут надо наоборот
                }
            })
        } else {
            // если курсор дал false, то берем просто смски, скип и курсор не указываем
            // и просто фетчим также смски, только уже без этого
            messages = await db.message.findMany({
                take: MESSAGES_BATCH,
                where: {
                    channelId
                },
                include: {
                    member: {
                        include: {
                            profile: true
                        }
                    }
                },
                orderBy: {
                    created_At: 'desc'
                }
            })
        }

        // т.е. мы сейчас положили в список все эти смски, которые мы нашли

        // дальше указываем следубщий курсор

        let nextCursor = null

        if (messages.length === MESSAGES_BATCH) { // если первую порцию загрузили, то надо сдвинуть курсор
            // как понять куда сдвинуть? 
            // просто обычный прикол со списком, где мы берем длину массива и -1 
            nextCursor = messages[MESSAGES_BATCH - 1].id // и кидаем айди строчки
            // если сообщений в канале меньше, то просто не переставляем некст курсор
        }

        return NextResponse.json({
            items: messages,
            nextCursor
        })



    } catch (error) {
        console.log(error)
        return new NextResponse('internal error', { status: 500 })
    }
}