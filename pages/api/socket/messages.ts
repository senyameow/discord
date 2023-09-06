import { currentProfile } from "@/lib/current-profile-pages";
import { db } from "@/lib/db";
import { NextApiResponseServerIo } from "@/types";
import { NextApiRequest } from "next";

export default async function handler(req: NextApiRequest, res: NextApiResponseServerIo) { // сюда уже кидаем не обычный тип для респонса, а наш для сокета
    if (req.method !== 'POST') return res.status(405).json({ error: 'method is not allowed' }) // так можем хендлить ситуации с разными методами
    // но у нас будет только пост метод
    try {

        const profile = await currentProfile(req)

        if (!profile) return res.status(401).json({ error: 'Unauthorized' })

        const { content, file_url } = req.body // так мы ловим то, что было отправлено по запросу

        const { channelId, serverId } = req.query // а вот так мы ловим квери (НУ ХОЧЕТСЯ КАК В АПИШКЕ ЧЕРЕЗ ПАРАМСЫ )

        if (!serverId) return res.status(400).json({ error: 'no server id provided' })
        if (!channelId) return res.status(400).json({ error: 'no channel id provided' })
        if (!content) return res.status(400).json({ error: 'no content provided' })

        // что мы вообще делаем?
        // все почти то же самое как и в апишке (ток синтаксис немного другой)
        // просто мы хотим найти нужный нам сервак и на него залить смску

        // по факту нам надо получить получить айдишник мембера и айдишник канала
        // какими путями вообще пофигу, просто надо 
        // т.к. чтобы залить смску в табличку messages, нам нужны эти поля там


        const server = await db.server.findFirst({
            where: {
                id: serverId as string, // ругается тс, что квери может прилететь списком или ну короче не строкой

                members: {
                    some: {
                        profileId: profile.id // проверка, что мы отправляем смску, в бд только если мы находимся в списке мемберов этого сервера (А ТО ЧИТЕРЫ ЧЕРЕЗ ЮРЛ БУДУТ запросы писать!!!)
                    }
                }

            },
            include: {
                members: true
            }
        })

        if (!server) return res.status(401).json({ error: 'server not found' })

        const channel = await db.channel.findFirst({ // находим канал, куда будем постить смску
            where: {
                id: channelId as string,
                serverId: serverId as string
            }
        })

        if (!channel) return res.status(401).json({ error: 'channel not found' })

        const member = server.members.filter(member => member.profileId === profile.id)[0] // ошибка была в том, что я мембер айди сравнивал с профайл айди, хотя это 2 разных поля и мне не находило мембера и возвращало ошибку

        if (!member) return res.status(401).json({ error: 'member not found' })

        // когда мы успешно нашли, все, что нам надо, можем создавать строчку в нашей табличке

        const message = await db.message.create({
            data: {
                content,
                channelId: channelId as string,
                memberId: member.id,
                deleted: false,
                fileUrl: file_url
            },
            include: {
                member: {
                    include: {
                        profile: true
                    }
                }
            }
        }) // т.к. мы еще и возвращаем смску (т.к. ее надо отобразить на ui естественно, то мы включаем еще профиль мембера (т.е. человека, который отправил смску))
        // чтобы, когда мы отправим назад наш ответ, мы смогли из него взять аватар и имя пользователя


        // создадим для сокета ключ для этой румы (т.к. у нас разные каналы => это разные румы сокета) 
        // из одного канала нельзя видеть смску из другого

        const channelKey = `chat:${channel.id}:messages`

        res.socket.server.io.emit(channelKey, message) // и эмитим 


        return res.status(200).json(message) // в этом способе мы вот так возвращаем ответ




    } catch (error) {
        console.log(error, 'MESSAGES_POST')
        return res.status(500).json({ error: 'internal error' }) // тут все как-то странно хд 
    }
}

// т.к. сокет еще не поддерживает всю ту новую шнягу с крутым api рутом и хендлом апишек не через вот это говно, то приходится юзать pages