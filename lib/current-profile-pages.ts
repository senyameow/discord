import { getAuth } from "@clerk/nextjs/server";

import { db } from "./db";
import { NextApiRequest } from "next";

// обычный current profile не сможет работать в pages фолдере

export const currentProfile = async (req: NextApiRequest) => {

    const { userId } = getAuth(req)

    if (!userId) return null

    const profile = await db.profile.findUnique({
        where: {
            user_id: userId
        }
    })

    return profile

}

// с помощью этой утилки мы будем искать в дбшке профайл, и если он не находится, то мы уже не создаем его а возвращаем нулл
// ну если нашли, то нашли и его вернули (почти как initial-profile, только не хотим создавать, а просто хотим искать)