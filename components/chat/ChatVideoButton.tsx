'use client'
// хочу сделать кнопку, которая будет висеть вверху, если зашел в диалог с юзером
// при нажатии будет создаваться рума и туда пушиться юзер
// как вообще это происходит?
// мы должны сделать запрос на сервер qs

import { useRouter, useParams, useSearchParams, usePathname } from "next/navigation"
import { Video, VideoOff } from "lucide-react"
import { ActionTooltip } from "../navigation/action-tooltip"
import { useEffect } from "react"
import qs from 'query-string'

interface ChatVideoButtonProps {
    name: string;

}


export const ChatVideoButton = ({ name }: ChatVideoButtonProps) => {
    const searchParams = useSearchParams()
    const isVideo = searchParams?.get('video')
    const pathname = usePathname()
    const router = useRouter()
    // URL -> `/dashboard?search=my-project`
    // `search` -> 'my-project'
    // (про searchParams)

    const Icon = isVideo ? Video : VideoOff


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
                video: isVideo ? undefined : true
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