import { currentProfile } from "@/lib/current-profile"
import { db } from "@/lib/db"
import { MemberRole } from "@prisma/client"
import { redirect } from "next/navigation"
import { NextResponse } from "next/server"


export async function POST(req: Request) { // просто прокинем один реквест, остальное достанем из квери
    try {

        const profile = await currentProfile()

        if (!profile) return new NextResponse('UNauthorazid', { status: 401 })

        const { searchParams } = new URL(req.url)

        const serverId = searchParams.get('serverId')

        const { name, type } = await req.json()

        if (!serverId) return new NextResponse('no server id', { status: 500 })

        if (name === 'general') return new NextResponse('name cannot be "general"', { status: 400 })

        const server = await db.server.update({
            where: {
                id: serverId,
                members: {
                    some: {
                        profileId: profile.id,
                        role: {
                            in: [MemberRole.ADMIN, MemberRole.MODERATOR] // вот так можно сказать, что только если у тебя роль из списка ролей
                        }
                    }
                }
            },
            data: {
                Channel: {
                    create: {
                        profileId: profile.id,
                        name,
                        type,
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
        console.log('CREATE CHANNEL ERROR', error)
    }
}