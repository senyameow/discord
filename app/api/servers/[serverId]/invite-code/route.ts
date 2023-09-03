
// с помощью новых тенхологий))) мы абезим стратку с патчем и обновляем ссылку

import { currentProfile } from "@/lib/current-profile"
import { db } from "@/lib/db"
import { NextResponse } from "next/server"
import { v4 as uuidv4 } from "uuid"

export async function PATCH(req: Request, { params }: { params: { serverId: string } }) {
    try {
        const profile = await currentProfile()

        if (!profile) return new NextResponse('Unauthorized!', { status: 401 })

        if (!params.serverId) return new NextResponse('Server Id Missed', { status: 400 })

        // если все проверки прошли, то мы апдейтим наш линк сервера просто-напросто

        const server = await db.server.update({
            where: {
                id: params.serverId,
                profileId: profile.id
            },
            data: {
                invite_code: uuidv4()
            }
        })

        // и отправляем обратно оджейсоненный сервер (апдейтнутый)
        return NextResponse.json(server) // делается вот так

    } catch (error) {
        console.log(error, '[SERVER ID]')
    }
}