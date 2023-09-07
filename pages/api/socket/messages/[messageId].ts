
// для чего нам вообще этот файл?
// по этому руту апишки мы делаем запрос для каждой смски []
// т.е. нам нужно было решить проблему
// как сделать так, чтобы мы могли редактировать сообщение?
// чтобы редактировать сообщение надо изменять его текст в базе данных
// чтобы изменить этот текст, мы делаем запрос на апишку
// если у нас не динамический рут, то придется как-то по-другому передавать айдишник сообщения
// а если у нас динамический рут, то мы просто принимаем его как парамс и радуемся жизни

// соответственно для каждой смски, свой рут

// также мы можем сюда передать дополнительную какую-то информацию через квери
// в нашем случае мы на странице получаем сервер айди и айди канала
// и здесь мы уже со спокойной душой используем это

import { currentProfile } from "@/lib/current-profile-pages";
import { db } from "@/lib/db";
import { NextApiResponseServerIo } from "@/types";
import { NextApiRequest } from "next";


export default async function handler(req: NextApiRequest, res: NextApiResponseServerIo) {

    // так как мы делаем это старым методом ( в фолдере pages ), то мы должны предотвратить всякие разные ненужные методы

    if (req.method !== 'DELETE' && req.method !== 'PATCH') {
        return res.status(500).json({ error: 'method is not allowed' }) // ошибки мы тоже по-странному хендлим тут
    }

    // и потом открыть трай кэтч

    try {

        const profile = await currentProfile(req)

        const { messageId, serverId, channelId } = req.query

        const { content } = req.body // и забираем контент

        if (!profile) return res.status(400).json({ error: 'Unauthorized' })
        if (!serverId) return res.status(400).json({ error: 'No server id' })
        if (!channelId) return res.status(400).json({ error: 'No channel id' })

        // теперь просто ищем сервак

        const server = await db.server.findFirst({
            where: {
                id: serverId as string,
                members: {
                    some: {
                        profileId: profile.id
                    }
                }
            },
            include: {
                members: true // нужны аватарки, имена
            }
        })
        if (!server) return res.status(400).json({ error: 'No server found' })


        const channel = await db.channel.findFirst({
            where: {
                id: channelId as string,
                serverId: serverId as string,

            }
        })
        if (!channel) return res.status(400).json({ error: 'No channel found' })

        // чувака уже можно файндом найти просто в списке

        const member = server.members.find(member => member.profileId === profile.id)

        if (!member) return res.status(400).json({ error: 'No member found' })


        let message = await db.message.findFirst({
            where: {
                channelId: channelId as string,
                memberId: member.id,
                id: messageId as string,

            },
            include: {
                member: {
                    include: {
                        profile: true
                    }
                }
            }
        })


    } catch (error) {
        console.log(error)
        return res.status(500).json({ error: 'internal error' })
    }


}