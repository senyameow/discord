import { currentProfile } from "@/lib/current-profile";
import { db } from "@/lib/db";
import { MemberRole } from "@prisma/client";
import { NextResponse } from "next/server";

export async function DELETE(req: Request, { params }: { params: { channelId: string } }) {
    try {
        const profile = await currentProfile()

        if (!profile) return new NextResponse('Unauthorized', { status: 401 })

        const { searchParams } = new URL(req.url)

        const serverId = (searchParams.get('serverId')) as string



        const server = await db.server.update({
            where: {
                id: serverId,
                profileId: profile.id,
                members: {
                    some: {
                        role: {
                            in: [MemberRole.ADMIN, MemberRole.MODERATOR]
                        }
                    }
                }

            },
            data: {
                Channel: {
                    delete: {
                        id: params.channelId,
                        name: {
                            not: 'general'
                        }
                    }
                }
            }
        })

        return NextResponse.json(server)

    } catch (error) {
        console.log(error)
        return new NextResponse('internal error', { status: 500 })
    }




}


export async function PATCH(req: Request, { params }: { params: { channelId: string } }) {
    try {
        const profile = await currentProfile()

        if (!profile) return new NextResponse('Unauthorized', { status: 401 })

        const { searchParams } = new URL(req.url)

        const { name, type } = await req.json()

        const serverId = (searchParams.get('serverId')) as string

        if (name === 'general') return new NextResponse('cannot edit general channel', { status: 400 })



        const server = await db.server.update({
            where: {
                id: serverId,
                profileId: profile.id,
                members: {
                    some: {
                        role: {
                            in: [MemberRole.ADMIN, MemberRole.MODERATOR]
                        }
                    }
                }

            },
            data: {
                Channel: {
                    update: {

                        where: {
                            id: params.channelId,
                            name: {
                                not: 'general'
                            }
                        },
                        data: {
                            name,
                            type
                        }

                    }

                }
            }
        })

        return NextResponse.json(server)

    } catch (error) {
        console.log(error)
        return new NextResponse('internal error', { status: 500 })
    }




}