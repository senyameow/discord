import { currentProfile } from "@/lib/current-profile"
import { db } from "@/lib/db"
import { NextResponse } from "next/server"


export async function PATCH(req: Request, { params }: { params: { memberId: string } }) {
    try {

        const profile = await currentProfile()

        // надо забрать searchParams и дату

        // как забирать дату, которую передали в req?
        // очень просто! деструктуризацией берем ее из отджейсоненного реквеста

        const { searchParams } = new URL(req.url)

        const serverId = searchParams.get('serverId') // из квери получаем сервер айди с помощью гет

        // ПОЧЕМУ МЫ НЕ МОЖЕМ ЧЕРЕЗ PARAMS ЗАБРАТЬ СЕРВЕР АЙДИ??
        // потому что в парамс приходит только то, что в скобочках, а там у нас memberId, значит только его и можно достать
        // поэтому мы дополнительно использовали query-string, чтобы в запрос кинуть еще и serverId
        // и его уже можно легко достать с помощью searchParams через new URL и гет, в гет пропихнуть название поля для квери
        // также мы можем и без парамсов забирать мембер айди, но если можно парамсами, то окей

        // просто нам очень очень нужен был сервер айди, т.к. мы будем менять дату только того сервера, чей айдишник прилетел
        // и в этом сервере искать уже мембера по его айдишнику

        if (!serverId) return new NextResponse('no server ID', { status: 400 })

        if (!params.memberId) return new NextResponse('no member ID', { status: 400 })



        if (!profile) return new NextResponse('Unauthorazid', { status: 401 })

        // идея в том, что мы делаем патч запрос, в него кидаем какую-то необходимую дату, которую надо поменять
        // с помозью qs, можно докинуть доп параметры (т.е. можно будет получить не только то, что в скобочках)
        // дальше создаем *новый* сервер в котором апдейтим дату
        // и через некстреспонс кидаем его обратно
        // а в той функции, которая onRoleChange, мы с помощью раутера рефрешим ui
        // и также открываем новую модалку уже с обновленной датой, чтобы точно все обновилось!

        const server = await db.server.update({
            where: {
                id: serverId,
                profileId: profile.id

            },
            data: {
                members: {
                    delete: {
                        id: params.memberId,
                        profileId: {
                            not: profile.id // что происходит, зачем мы это добавляем??????
                            // потому что когда мы нажимаем на смену роли, то мы делаем запрос на апишку
                            // но по факту этот запрос на апишку можно сделать и через юрл строчку
                            // тогда например, админ можем сам себе сменить легко роль через юрл, задав правильный запрос
                            // а теперь он так сделать не сможет!
                        }
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
        }) // инклюдом включили все наши колонки, которые были в ServerWithOEKoqjei типе данных

        return NextResponse.json(server) // и возвращаем отджейсоненный сервер обратно




    } catch (error) {
        console.log(error)
        return new NextResponse('internal error', { status: 500 })
    }
}