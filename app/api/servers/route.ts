import { currentProfile } from "@/lib/current-profile";
import { db } from "@/lib/db";
import { MemberRole } from "@prisma/client";
import { NextResponse } from "next/server";
import { v4 as uuidv4 } from "uuid";

// идея в чем? 
// мы *собираем данные с юзера(картинку и имя сервера) и создаем с помощью аксиоса пост запрос*
// чтобы это реализовать мы должны сделать фолдер api в app (ОБЯЗАТЕЛЬНО в app!)
// дальше можно по гайду некста
// экспортируем асинхронную функцию, которая принимает реквест (в нем лежат наши значения)
// мы парсим реквест в джейсон и достаем наши поля с помощью деструктуризации
// (+ еще раз проверяем зареган ли юзер (с помощью утилки забираем текущий профиль))
// если не зареган, то ошибку кидаем (ну как-то хендлим момент), т.к незареганный юзер не может добавить сервак себе 

export async function POST(req: Request) {
    try {

        // из посылки достаем наше содержимое 
        const { name, image_url } = await req.json()

        //...
        const profile = await currentProfile()
        if (!profile) return new NextResponse('unauthorazid', { status: 401 })

        const server = await db.server.create({
            data: {
                invite_code: uuidv4(),
                image_url,
                name,
                profileId: profile.id, // и прокидываем профайл айди, т.к. у нас relation с табличкой профайлов 

                Channel: {
                    create: [
                        { name: 'general', profileId: profile.id }
                    ]
                },
                members: {
                    create: [
                        { role: MemberRole.ADMIN, profileId: profile.id }
                    ]
                }
            }
        }) // заполняем табличку сервер

        return NextResponse.json(server) // и возвращаем некстреспонсом отджейсоненый сервер

    } catch (error) {
        console.log('SERVERS/POST', error)
        return new NextResponse('Internal Error', { status: 500 })
    }
}