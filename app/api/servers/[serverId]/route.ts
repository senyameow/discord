import { currentProfile } from "@/lib/current-profile"
import { db } from "@/lib/db"
import { redirectToSignIn } from "@clerk/nextjs"
import { NextResponse } from "next/server"

export async function PATCH(req: Request, { params }: { params: { serverId: string } }) { // serverId должен совпадать со штучкой в скобках
    try {
        const profile = await currentProfile()

        // чтобы изменить дату мне нужно забрать из реквеста формдату и потом уже апдейтить

        const { name, image_url } = await req.json()

        if (!profile) return new NextResponse('Unauthorized', { status: 401 })

        const server = await db.server.update({
            where: {
                id: params.serverId,
                profileId: profile.id
            },
            data: {
                name,
                image_url
            }
        })

        return NextResponse.json(server)

    } catch (error) {
        console.log(error, 'SERVER PATCH')
        return new NextResponse('internal error', { status: 500 })
    }
}