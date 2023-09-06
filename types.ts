import { Member, Profile, Server } from "@prisma/client";

import { Server as NetServer, Socket } from 'net'
import { NextApiResponse } from "next";
import { Server as SocketIoServer } from "socket.io";

export type ServerWithMembersWithProfiles = Server & {
    members: (Member & { profile: Profile })[]
}
// вот так просто можно создать крутой тип, который можно переиспользовать потом очень очень много раз

export type NextApiResponseServerIo = NextApiResponse & {
    socket: Socket & {
        server: NetServer & {
            io: SocketIoServer
        }
    }
}
