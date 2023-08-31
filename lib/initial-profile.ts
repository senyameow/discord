import { currentUser, redirectToSignIn } from "@clerk/nextjs";
import { db } from "./db";


// используем клёрк чтобы поймать текущего юзера, и если его нет, то редиректим его на ауф страничку

export const initialProfile = async () => {
    const user = await currentUser() // если юзера нет, то вернет null, поэтому проверка на юзера простая через !

    if (!user) return redirectToSignIn()

    const profile = await db.profile.findUnique({
        where: {
            user_id: user.id
        }
    }) // найти профиль зареганного сейчас чела (по айдишнику), а т.к. айдишники unique, то файндюник найдет нам кого надо

    if (profile) return profile // если уже есть профиль, то его и возвращаем

    // если же нет, то надо его создать

    // ждем, вызываем дб и в табличку профайлов креэйтим новый профиль

    const newProfile = await db.profile.create({
        data: {
            user_id: user.id,
            name: `${user.firstName} ${user.lastName}`,
            image_url: user.imageUrl,
            email: user.emailAddresses[0].emailAddress,
        }
    })

    return newProfile
}

// с помощью этой полезной утилки мы можем сразу доставать профак
