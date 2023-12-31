
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
import { MemberRole } from "@prisma/client";
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
        }) // нашли смску

        if (!message?.deleted && !message) return res.status(400).json({ error: 'no message found' })

        // сделаю переменные, но хз зачем

        const isMod = member.role === MemberRole.MODERATOR
        const isOwner = message.memberId === member.id
        const isAdmin = member.role === MemberRole.ADMIN
        const ableToEdit = isOwner || isAdmin || isMod

        if (!ableToEdit) return res.status(401).json({ error: 'Unauthorized' })

        if (req.method === 'DELETE') {

            message = await db.message.update({ // мы не удаляем, а именно заменяем, т.к. делит просто удаляет строчку
                // а нам надо просто удалить контент и поставить тру в столбике с делитед
                where: {
                    id: messageId as string,
                    channelId: channelId as string,
                },
                data: {
                    fileUrl: null,
                    content: 'This message has been deleted',
                    deleted: true,
                },
                include: {
                    member: {
                        include: {
                            profile: true
                        }
                    }
                }
            })
        }
        if (req.method === 'PATCH') {
            // даже тут мы должны проверять, абсурдные условия
            if (!isOwner) return res.status(401).json({ error: 'not allowed' })
            // т.к. может быть такое, что попытаются как-то другими путями, хотя мы даже не показываем кнопку в таком случае
            // но так как мы делаем это через апишку, то рассматриваем все случаи 
            message = await db.message.update({ // мы не удаляем, а именно заменяем, т.к. делит просто удаляет строчку
                // а нам надо просто удалить контент и поставить тру в столбике с делитед
                where: {
                    id: messageId as string,
                    channelId: channelId as string,

                },
                data: {
                    content
                },
                include: {
                    member: {
                        include: {
                            profile: true
                        }
                    }
                }
            })
        }

        const updateKey = `chat:${channelId}/messages/update`

        res?.socket?.server?.io?.emit(updateKey, message) // так мы кидаем в сокет инфу (через emit)

        // респонс сокет сервер айо => emit(key, args)

        return res.status(200).json(message)


    } catch (error) {
        console.log(error)
        return res.status(500).json({ error: 'internal error' })
    }


}