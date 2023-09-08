// окей, чтобы у нас был крутой чат, что мы должны сделать? 
// 1. создали квери провайдер и обернули приложение
// 2. нужен хук для фетча и для норм скрола с прогрузкой сообщений


import qs from 'query-string'

import { useInfiniteQuery } from '@tanstack/react-query'

// + надо получить доступ к сокету, т.е. его тоже берем сюда (ну хук стор пох)

import { useSocket } from '../providers/SocketProvider'

// далее создаем интерфейс, потому что нам надо понимать, как делать запрос

interface useChatProps {
    queryKey: string;
    apiUrl: string;
    paramKey: 'channelId' | 'conversationId'
    paramValue: string;

}

export const useChatQuery = ({ queryKey, apiUrl, paramKey, paramValue }: useChatProps) => {

    const { isConnected } = useSocket() // забираем стейт с коннектом

    const fetchMessages = async ({ pageParam = undefined }) => {
        // создаем юрл, по которому будет происходить запрос


        const url = qs.stringifyUrl({
            url: apiUrl,
            query: {
                cursor: pageParam, // это для скрола я так понимаю
                [paramKey]: paramValue
            }
        }, { skipNull: true })

        const res = await fetch(url)

        return res.json() // да мне надо вернуть именно промис, не ждать 

    }

    // а теперь пишем само квери

    const { data, fetchNextPage, hasNextPage, isFetchingNextPage, status } = useInfiniteQuery({
        queryKey: [queryKey],
        queryFn: fetchMessages,
        getNextPageParam: (lastPage, pages) => lastPage?.nextCursor,
        refetchInterval: isConnected ? false : 1000 // будет рефетчить дату каждую секунду (именно этой страницы)
    })

    // теперь просто надо вернуть все эти значения

    return { data, fetchNextPage, hasNextPage, isFetchingNextPage, status }

}

// когда мы сделали эту штуку, теперь идем туда, где будут смски появляться и заполняемся) *ChatMessages