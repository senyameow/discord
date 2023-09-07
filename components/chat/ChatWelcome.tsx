import { Hash } from 'lucide-react';
import React from 'react'

interface ChatWelcomeProps {
    name: string;
    type: 'channel' | 'conversation' // таким образом мы добавляем динамичность странице, т.е. переходим на другой тип диалога
    // и отрисовка уже будет другая
}

const ChatWelcome = ({ name, type }: ChatWelcomeProps) => {
    return (
        <div className='flex flex-col gap-3 px-4 mb-4 items-start'>
            {type === 'channel' && (
                <div className='h-[75px] w-[75px] rounded-full bg-zinc-500 dark:bg-zinc-700 flex items-center justify-center'>
                    <Hash className='text-zink-400 dark:text-zinc-200 w-[40px] h-[40px]' />
                </div>
            )}
            <p className='text-xl md:text-3xl font-bold text-zinc-100'>
                {type === 'channel' ? 'Welcome to #' : ''}{name}
            </p>
            <p className='text-zinc-300 text-[16px]'>
                {type === 'channel' ? `This is the start of the #${name} channel.` : `This is the start of your dialog with ${name}`}
            </p>
        </div>
    )
}

export default ChatWelcome