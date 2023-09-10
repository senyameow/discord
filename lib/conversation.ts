

// мы нажимаем на юзера и нам находит диалог с ним (или создает его) 
// мы не можем просто редиректить человека по айди 
// т.к. если юзер только зашел на серак, а диалога с ним еще не было
// то если мы просто запушим его на страничку через апишку, то будет 404
// поэтому нам нужна утилка, которая будет создавать диалог, если его еще нет

import { db } from "./db";

interface ConversationProps {
    memberOneId: string;
    memberTwoId: string;
}

export const getConversation = async (memberOneId: string, memberTwoId: string) => {
    console.log(memberOneId, 'MEMBER ONE ID')
    console.log(memberTwoId, 'MEMBER TWO ID')
    try {

        let conversation = await findConversation(memberOneId, memberTwoId) || await findConversation(memberTwoId, memberOneId)
        // типо диалоги могут быть в двух направлениях, соответственно, искать их тоже нужно в двух 
        // с помозью пайпов можем в одну строчку записать (если не найдет по первому, будет искать по второму)
        console.log(conversation, 'GET CONVERSATION')

        if (!conversation) {
            conversation = await createNewConversation(memberOneId, memberTwoId) // если не смогли найти, то создаем!

        }
        return conversation



    } catch (error) {
        return null
    }
}

export const findConversation = async (memberOneId: string, memberTwoId: string) => {
    try {
        return await db.conversation.findFirst({
            where: {

                AND: [
                    { memberOneId: memberOneId },
                    { memberTwoId: memberTwoId },
                ] // найдет в тибличке с диалогами только тот, где совпадают два эти условия одновременно
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
            } // сразу в диалог включаем строчки профилей двух юзеров
        })
    } catch (error) {
        return null
    }


}

export const createNewConversation = async (memberOneId: string, memberTwoId: string) => {
    try {
        return await db.conversation.create({
            data: {
                memberOneId,
                memberTwoId
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
    } catch (error) {
        return null
    }
}
