import { currentProfile } from '@/lib/current-profile';
import { db } from '@/lib/db';
import { redirectToSignIn } from '@clerk/nextjs';
import { redirect } from 'next/navigation';
import React from 'react'


// как вообще будет происходить процесс перехода по инвайт ссылке.
// явно нам надо добавить челика в список мемберов сервера (но как?)

// окей гоу степ бай степ
// я кидаю мужику линк, он такой воу круто нажимаю
// что дальше?
// ну сначала надо сразу взять профайл, и если его нет, что отправлять его логиниться


interface InviteCodePageParams {
    params: {
        inviteCode: string;
    }
}

const InviteCodePage = async ({ params }: InviteCodePageParams) => {

    const profile = await currentProfile()

    if (!profile) {
        return redirectToSignIn({ returnBackUrl: 'http://localhost:3000/sign-in' })
    }

    if (!params.inviteCode) return redirect('/')

    // если мужик уже на серваке, и пытается зайти на сервак, то ну надо это захендлить как-то

    const existingServer = await db.server.findFirst({ // находим тот сервак, на который юзер пытается зайти
        where: {
            invite_code: params.inviteCode, // ссылочка совпала с той, что в таблице
            members: {
                some: { // + в колонке мемберов есть хотя бы 1 чувак с профайлайди чувака, который сейчас регнут
                    profileId: profile.id
                }
            }
        }
    })

    // если он пытается принять инвайт на этот серв, то мы его просто редиректнем на ту ссылку

    if (existingServer) return redirect(`/servers/${existingServer.id}`)

    // как же мы помещаем юзера на сервер?

    const server = await db.server.update({ // Обновляем только тот сервак, где инвайт код совпадает (логично xd)
        where: {
            invite_code: params.inviteCode
        },
        data: {
            members: {
                create: [
                    {
                        profileId: profile.id
                    }
                ]
            }
        }
    }) // и все создали там мембера и редиректим туда мужика

    if (server) return redirect(`/servers/${server.id}`)

    return null
}

export default InviteCodePage