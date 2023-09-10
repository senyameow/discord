import { currentProfile } from "@/lib/current-profile-pages";
import { db } from "@/lib/db";
import { NextApiResponseServerIo } from "@/types";
import { NextApiRequest } from "next";

export default async function handler(req: NextApiRequest, res: NextApiResponseServerIo) { // сюда уже кидаем не обычный тип для респонса, а наш для сокета
    if (req.method !== 'POST') return res.status(405).json({ error: 'method is not allowed' }) // так можем хендлить ситуации с разными методами
    // но у нас будет только пост метод
    try {

        const profile = await currentProfile(req)

        if (!profile) return res.status(401).json({ error: 'WQEWQQWE' })

        const { content, fileUrl } = req.body // так мы ловим то, что было отправлено по запросу

        const { conversationId } = req.query // а вот так мы ловим квери (НУ ХОЧЕТСЯ КАК В АПИШКЕ ЧЕРЕЗ ПАРАМСЫ )

        if (!conversationId) return res.status(400).json({ error: 'no server id provided' })
        if (!content) return res.status(400).json({ error: 'no content provided' })

        // что мы вообще делаем?
        // все почти то же самое как и в апишке (ток синтаксис немного другой)
        // просто мы хотим найти нужный нам сервак и на него залить смску

        // по факту нам надо получить получить айдишник мембера и айдишник канала
        // какими путями вообще пофигу, просто надо 
        // т.к. чтобы залить смску в табличку messages, нам нужны эти поля там


        const conversation = await db.conversation.findUnique({
            where: {
                id: conversationId as string,
                OR: [ // просто надо правильно OR написать, и все заработает
                    {
                        memberOne: {
                            profileId: profile.id
                        },
                    },
                    {
                        memberTwo: {
                            profileId: profile.id
                        }
                    }
                ]
                // немного непонятный запрос, но ничего страшного
                // // по факту тут написано, что нам надо найти такую строчку в табличке диалогов
                // // где айдишник зареганного сейчас чела, совпадает либо со столбиком 1ого мембера, либо второго
                // // если мы не добавляем это условие, то тогда возможна ситуация, что 

            },
            include: {
                memberOne: {
                    include: {
                        profile: true
                    }
                },
                memberTwo: {
                    include: {
                        profile: true
                    }
                }
            }
        })


        const member = conversation?.memberOne.profileId === profile.id ? conversation.memberOne : conversation?.memberTwo


        if (!member) {
            return res.status(401).json({ error: 'member not found' })
        }

        // когда мы успешно нашли, все, что нам надо, можем создавать строчку в нашей табличке

        const message = await db.directMessage.create({
            data: {
                content,
                conversationId: conversationId as string,
                memberId: member.id,
                file_url: fileUrl,

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

        const channelKey = `chat:${conversationId}:messages`

        res?.socket?.server?.io?.emit(channelKey, message) // инициируем событие, и отправляем дату (message)


        return res.status(200).json(message) // в этом способе мы вот так возвращаем ответ




    } catch (error) {
        console.log(error, 'MESSAGES_POST')
        return res.status(500).json({ error: 'internal error' }) // тут все как-то странно хд 
    }
}

// т.к. сокет еще не поддерживает всю ту новую шнягу с крутым api рутом и хендлом апишек не через вот это говно, то приходится юзать pages