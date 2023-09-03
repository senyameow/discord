import { currentProfile } from "@/lib/current-profile"
import { db } from "@/lib/db"
import { NextResponse } from "next/server"


export async function PATCH(req: Request, { params }: { params: { serverId: string } }) {
    try {

        const profile = await currentProfile()

        if (!profile) return new NextResponse('Unauthorized', { status: 401 })

        if (!params.serverId) return new NextResponse('no server id', { status: 400 })

        const server = await db.server.delete({
            where: {
                id: params.serverId,
                profileId: profile.id,


            }

        })

        return NextResponse.json(server)

    } catch (error) {
        console.log('LEAVE SERVER ERROR', error)
    }
}