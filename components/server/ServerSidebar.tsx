import { currentProfile } from '@/lib/current-profile';
import { db } from '@/lib/db';
import { ChannelType, MemberRole, Server } from '@prisma/client';
import { redirect } from 'next/navigation';
import React from 'react'
import ServerHeader from './ServerHeader';
import { ScrollArea } from '../ui/scroll-area';
import ServerSearch from './ServerSearch';
import { Hash, Mic, Shield, ShieldAlert, ShieldCheck, Video } from 'lucide-react';
import { Separator } from '../ui/separator';
import ServerSection from './ServerSection';
import ServerChannel from './ServerChannel';
import ServerMember from './ServerMember';

interface ServerSidebarProps {
    serverId: string;
}

const iconMap = {
    [ChannelType.TEXT]: <Hash className='h-4 w-4 mr-2' />,
    [ChannelType.AUDIO]: <Mic className='h-4 w-4 mr-2' />,
    [ChannelType.VIDEO]: <Video className='h-4 w-4 mr-2' />
} // таким образом можно передавать иконку взависимости от чего-то

const memberIconRole = {
    [MemberRole.GUEST]: null,
    [MemberRole.MODERATOR]: <ShieldCheck className='w-4 h-4 mr-2 ' />,
    [MemberRole.ADMIN]: <ShieldAlert className='w-4 h-4 mr-2 ' />
}

const ServerSidebar = async ({ serverId }: ServerSidebarProps) => {


    const profile = await currentProfile()

    if (!profile) return redirect('/')


    // ловим сервак

    const server = await db.server.findUnique({
        where: {
            id: serverId
        },
        include: {
            Channel: {
                orderBy: {
                    created_at: 'asc'
                }
            },
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

    if (!server) return redirect('/') // поэксперементировать

    const textChannels = server?.Channel.filter(channel => channel.type === ChannelType.TEXT)
    const audioChannels = server?.Channel.filter(channel => channel.type === ChannelType.AUDIO)
    const videoChannels = server?.Channel.filter(channel => channel.type === ChannelType.VIDEO)

    // разделим наши каналы по их типу (будет легче рендерить проходясь по списку мэпом)

    // получим все мемберов (но себя не надо) Я лежит в profile сейчас
    // просто отфильтруем всех мемберов, где их айдишник не равен профайл.айди

    const members = server?.members.filter(member => member?.profileId !== profile.id) // все, кроме нас

    const role = server?.members.find(member => member?.profileId === profile.id)?.role // вернет нашу роль на сервере

    // т.к. профайл это любой чел, мы должны найти его роль
    // например регается мужик к нам на сервак, у него не может быть админка
    // поэтому мы ищем роль, а не говорим, что если айдишник с нами совпал, то все мы короли танцпола



    return (
        <div className='h-full flex flex-col text-primary bg-[F2F3F5] dark:bg-[2B2D31] w-full'>
            <ServerHeader server={server} role={role} />
            <ScrollArea className='flex-1 px-3'> {/* даем флекс 1 т.к. должна занимать все остальную область px - отступ по краям */}
                <div className='mt-2'>
                    <ServerSearch data={[
                        {
                            label: 'text channels',
                            type: 'channel',
                            data: textChannels.map(channel => ({
                                id: channel.id,
                                name: channel.name,
                                icon: iconMap[channel.type]
                            }))
                        },
                        {
                            label: 'voice channels',
                            type: 'channel',
                            data: audioChannels.map(channel => ({
                                id: channel.id,
                                name: channel.name,
                                icon: iconMap[channel.type]
                            }))
                        },
                        {
                            label: 'video channels',
                            type: 'channel',
                            data: videoChannels.map(channel => ({
                                id: channel.id,
                                name: channel.name,
                                icon: iconMap[channel.type]
                            }))
                        },
                        {
                            label: 'members',
                            type: 'member',
                            data: members.map(member => ({
                                id: member.id,
                                name: member.profile.name,
                                icon: memberIconRole[member.role]
                            }))
                        },
                    ]} />
                </div>
                <Separator className='my-2 text-zinc-400 bg-zinc-200 dark:bg-zinc-700 rounded-md' />
                {!!textChannels?.length && (
                    <div className="mb-2">
                        <ServerSection
                            sectionType="channels"
                            channelType={ChannelType.TEXT}
                            role={role}
                            label="Text Channels"
                        />
                        <div className="space-y-[2px]">
                            {textChannels.map((channel) => (
                                <ServerChannel
                                    key={channel.id}
                                    channel={channel}
                                    role={role}
                                    server={server}
                                />
                            ))}
                        </div>
                    </div>
                )}
                {!!audioChannels?.length && (
                    <div className="mb-2">
                        <ServerSection
                            sectionType="channels"
                            channelType={ChannelType.AUDIO}
                            role={role}
                            label="Voice Channels"
                        />
                        <div className="space-y-[2px]">
                            {audioChannels.map((channel) => (
                                <ServerChannel
                                    key={channel.id}
                                    channel={channel}
                                    role={role}
                                    server={server}
                                />
                            ))}
                        </div>
                    </div>
                )}
                {!!videoChannels?.length && (
                    <div className="mb-2">
                        <ServerSection
                            sectionType="channels"
                            channelType={ChannelType.VIDEO}
                            role={role}
                            label="Video Channels"
                        />
                        <div className="space-y-[2px]">
                            {videoChannels.map((channel) => (
                                <ServerChannel
                                    key={channel.id}
                                    channel={channel}
                                    role={role}
                                    server={server as Server}
                                />
                            ))}
                        </div>
                    </div>
                )}
                {!!members?.length && (
                    <div className="mb-2">
                        <ServerSection
                            sectionType="members"
                            role={role}
                            label="Members"
                        // server={server}
                        />
                        <div className="space-y-[2px]">
                            {members.map((member) => (
                                <ServerMember
                                    key={member.id}
                                    member={member}
                                    server={server}
                                />
                            ))}
                        </div>
                    </div>
                )}
            </ScrollArea>
        </div>
    )
}

export default ServerSidebar