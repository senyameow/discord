"use client";

// делаем румку!!! сюдааааааа

import '@livekit/components-styles';
import {
    LiveKitRoom,
    VideoConference,
    GridLayout,
    ParticipantTile,
} from '@livekit/components-react';
import { useEffect, useState } from 'react';

import { useUser } from '@clerk/nextjs';
import { Loader2 } from 'lucide-react';

interface MediaRoomProps {
    chatId: string;
    video: boolean;
    audio: boolean;
}

export const MediaRoom = ({ chatId, video, audio }: MediaRoomProps) => {

    // мне нужен токен и юрл (по докам)
    // токен составляется из многих вещей, а точнее
    // roomName, userName, at, который в свою очередь состоит из
    // api-key, secret-key, {identity: userName}
    // at.addGrant({ roomJoin: true, room: roomName, canPublish: true, canSubscribe: true }); и кидаем вот такое +-
    // const token = at.toJwt(); 

    const { user } = useUser() // можем из клерка забрать 1023123123 инфы про зареганного юзера
    const [token, setToket] = useState('')

    useEffect(() => {
        // if (user?.id) {
        //     console.log(user)
        //     return
        // }

        const name = `${user?.id}`;

        (async () => {
            try {
                const res = await fetch(`/api/livekit?room=${chatId}&username=${name}`) // так мы можем разделять чаты, т.е. для каждого чата свое айди, поэтому запросы на разные апишки

                const data = await res.json() // нужна дата, чтобы из нее получить этот токен

                setToket(data.token) // и устанавливаем токен а на апишке мы как раз уже составляем этот токен

            } catch (error) {
                console.log(error)
            }
        })();


    }, [user?.firstName, user?.lastName, chatId])

    // токен может фетчиться долго, поэтому нужна проверка

    if (token === '') {
        return (
            <div className='flex flex-col flex-1 items-center justify-center'>
                <Loader2 className='w-7 h-7 animate-spin text-zinc-500' />
                <p>Loading...</p>
            </div>
        )
    } // нам надо было захендлить ситуацию с лоадингом

    // если токен появился, это значит, что мы можем войти в руму
    // для этого у нас уже есть LiveKitRoom
    return (
        <LiveKitRoom token={token} data-lk-theme='default' serverUrl={process.env.NEXT_PUBLIC_LIVEKIT_URL} video={video} audio={audio}>
            <VideoConference /> {/* и внутрь закидываем видео конференцию */}
        </LiveKitRoom>
    )
}
// теперь у нас есть такой компонент, который мы несем в чат, и будем рендерить, только тогда, когда тип канала подходящийы
// т.е. на самом деле довольно умнО придумано:
// мы нажимаем на канал, у нас меняется тип канала на текст, компонент не рендерится, вместо него рендерится чат
// нажимаем на видео / аудио компоненты и рендерится компонент => срабатывает юзэффект, делает запрос на апишку, на которой
// формируется токен для этой комнаты и для этого юзера
// пока он формируется мы просто крутим лоадер
// как загрузился лоадер убирается и выводится рума