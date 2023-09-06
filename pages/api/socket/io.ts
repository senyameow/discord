import { createServer } from "http";
import { Server as ServerIO } from "socket.io";
import { NextApiRequest } from "next";

import { NextApiResponseServerIo } from "@/types"; // нам нужен этот кастомный тип
import { NextServer } from "next/dist/server/next";

export const config = {
    api: {
        bodyParser: false
    }
}

const ioHandler = (req: NextApiRequest, res: NextApiResponseServerIo) => {

    if (!res.socket.server.io) {
        const path = `/api/socket/io`
        const httpServer: NextServer = res.socket.server as any
        // создаем io
        // @ts-ignore
        const io = new ServerIO(httpServer, {
            path,
            addTrailingSlash: false
        })
        res.socket.server.io = io
    }

    res.end()
} // на самом деле лучше просто запомнить

export default ioHandler;