import React from 'react'

interface ServerPageProps {
    params: {
        serverId: string
    }
}

const ServerPage = async ({ params }: ServerPageProps) => {
    return (
        <div>ServerIdPage</div>
    )
}

export default ServerPage