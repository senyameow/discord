import { useEffect, useState } from "react";


type ChatScrollProps = {
    chatRef: React.RefObject<HTMLDivElement>; // прокидываем реф для чата
    bottomRef: React.RefObject<HTMLDivElement>; // реф для конца
    shouldFetchNextPage: boolean; // будет прилетать стейт тру или фолз
    fetchMore: () => void; // и фетч функция
    count: number; // хз пока для чего
}

export const useChatScroll = ({ chatRef, bottomRef, fetchMore, count, shouldFetchNextPage }: ChatScrollProps) => {
    // так, а что пишем?
    // надо задать стейт на инициализацию
    const [initialized, setInitialized] = useState(false)
    // некст 

    // как оно будет понимать, что надо фетчить следубщую порцию
    // на самом деле очень просто, если хорошо знать рефы
    // Свойство scrollTop считывает или устанавливает количество пикселей, прокрученных от верха элемента.
    // вот такой фигней можно воспользоваться
    // мы прокинули на чат, у него overflow-y-auto, т.е. он скролится, все окей (не хидден)
    // если ползунок стоит в самом верху, то значение для скроллтопа = 0, этим можно и воспользоваться

    // сообственно как?
    // если у нас есть следубщая страничка, и 0, то гоу фетчить следующую страницу
    // это происходит по эффекту, конечно же, т.е. юзаем useEffect 

    useEffect(() => {
        const handleScroll = () => {

            if (chatRef?.current?.scrollTop === 0) {
                fetchMore()
            }
        }
        // это у нас как слушатель события (scroll), т.е. каждый раз при скролле выполни функцию хендлскролл

        chatRef.current?.addEventListener('scroll', handleScroll)

        return () => {
            chatRef.current?.removeEventListener('scroll', handleScroll)
        }


    }, [fetchMore, chatRef, shouldFetchNextPage])

    useEffect(() => {

        // но как сделать так, чтобы он сам скролился до низу
        // проблема в том, что на слушатель мы это поставить не можем, т.к. в чем смысл
        // надо, чтобы он сам понимал, когда надо скроллить, а когда нет
        // для этого делаем функцию, которая будет возвращать как раз ему приказ (true / false)


        const shouldAutoScroll = () => {
            if (!initialized && bottomRef?.current) { // если стейт еще ложный, но конец чата появился, то стейт делаем трушный
                setInitialized(true)
                return true
            }
            if (!chatRef.current) {
                console.log('NO CHAT!')
                return false
            } // если чат еще не прогрузился (т.е. просто в дом дереве у нас нет такого элемента)
            // то, конечно, никуда скроллить не надо

            // теперь самое главное!
            // когда появляется новое сообщение, создается новый див, он занимает какое-то число пикселей
            // так как у нас нет автоскролла пока, то у нас просто расширяется див чата, соответственно длина между началои и концом становится больше
            // эти воспользуемся, и сделаем так, чтобы он выводил маркер

            const distanceFromTop = chatRef.current.scrollHeight - chatRef.current.clientHeight - chatRef.current.scrollTop // устанешь думать)
            return distanceFromTop <= 200 // при новой смске появляется 217 пикселей вроде 



            // Свойство Element.scrollHeight (только чтение) - измерение высоты контента в элементе, включая содержимое, невидимое из-за прокрутки. Значение scrollHeight равно минимальному clientHeight, которое потребуется элементу для того, чтобы поместить всё содержимое в видимую область (viewport), не используя вертикальную полосу прокрутки. Оно включает в себя padding элемента, но не его margin.

            // сам скролл будем по таймауту работать, иначе что-то другое сложно придумать просто





        }
        if (shouldAutoScroll()) {
            setTimeout(() => {
                bottomRef?.current?.scrollIntoView({
                    behavior: 'smooth'
                })
            }, 100);
        }
    }, [bottomRef, chatRef, count, initialized])
}

// ОНО РАБОТАЕТ!!!!

// ЭТУ ШТУКУ МОЖНО ПЕРЕИСПОЛЬЗОВАТЬ
// ЕСЛИ НАДО РЕАЛИЗОВАТЬ АВТОСКРОЛЛ И ЗАГРУЗКУ ПРИ СКРОЛЛЕ НА САМЫЙ ВЕРХ