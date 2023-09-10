'use client'
// хочу сделать кнопку, которая будет висеть вверху, если зашел в диалог с юзером
// при нажатии будет создаваться рума и туда пушиться юзер
// как вообще это происходит?
// мы должны сделать запрос на сервер qs

import { useRouter, useParams, useSearchParams, usePathname } from "next/navigation"
import { Mic, MicOff, Video, VideoOff } from "lucide-react"
import { ActionTooltip } from "../navigation/action-tooltip"
import { useEffect } from "react"
import qs from 'query-string'

interface ChatMicButtonProps {
    name: string;

}


export const ChatMicButton = ({ name }: ChatMicButtonProps) => {
    const searchParams = useSearchParams()
    const isAudio = searchParams?.get('audio')
    const pathname = usePathname()
    const router = useRouter()
    // URL -> `/dashboard?search=my-project`
    // `search` -> 'my-project'
    // (про searchParams)

    const Icon = isAudio ? MicOff : Mic


    // у нас есть базовый прикол, когда хотим как-то ответить на изменения пути



    // 'use client'

    // import { usePathname, useSearchParams } from 'next/navigation'

    // function ExampleClientComponent() {
    //     const pathname = usePathname()
    //     const searchParams = useSearchParams()
    //     useEffect(() => {
    //         // Do something here...
    //     }, [pathname, searchParams])
    // }

    // Обычно сюда еще раутер нужен

    const onClick = () => {
        const url = qs.stringifyUrl({
            url: pathname || '',
            query: {
                audio: isAudio ? undefined : true
            }
        })
        router.push(url)
    }

    return (
        <ActionTooltip label={`call ${name}`}>
            <button onClick={onClick}>
                <Icon />
            </button>
        </ActionTooltip>
    )

}