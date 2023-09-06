'use client'

import { useSocket } from "./providers/SocketProvider"
import { Badge } from "./ui/badge"

export const SocketIndicator = () => {
    const { isConnected } = useSocket()

    if (!isConnected) {
        return (
            <Badge variant={'outline'} className="bg-yellow-600 border-none text-white">
                fail to connect
            </Badge>
        )
    }
    return (
        <Badge variant={'outline'} className="bg-emerald-600 border-none text-white">
            connected
        </Badge>
    )
}