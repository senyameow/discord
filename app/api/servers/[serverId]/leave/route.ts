import { currentProfile } from "@/lib/current-profile"
import { db } from "@/lib/db"
import { NextResponse } from "next/server"


export async function PATCH(req: Request, { params }: { params: { serverId: string } }) {
    try {

        const profile = await currentProfile()

        if (!profile) return new NextResponse('Unauthorized', { status: 401 })

        if (!params.serverId) return new NextResponse('no server id', { status: 400 })

        const server = await db.server.update({
            where: {
                id: params.serverId,
                profileId: {
                    not: profile.id // чтобы админ через юрл не смог ливнуть с сервера, т.к. в табличке серверов, в колонку profileId сохраняется айди чела, который создал этот сервер
                },
                members: {
                    some: {
                        profileId: profile.id // а вот уже в табличке мемберов можно, т.к. там просто их профайл айдишники
                    }
                }
            },
            data: {
                members: {
                    deleteMany: {
                        profileId: profile.id

                    }
                }
            },
            include: {
                members: {
                    include: {
                        profile: true
                    },
                    orderBy: {
                        role: 'asc'
                    }
                }
            }
        })

        return NextResponse.json(server)

    } catch (error) {
        console.log('LEAVE SERVER ERROR', error)
    }
}