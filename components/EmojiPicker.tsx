import React from 'react'

import {
    Popover,
    PopoverContent,
    PopoverTrigger,
} from "@/components/ui/popover"
import { Smile } from 'lucide-react';

import data from '@emoji-mart/data'

import Picker from '@emoji-mart/react'

import { useTheme } from 'next-themes';


interface EmojiPickerProps {
    onChange: (value: string) => void;
    value?: string;
}

const EmojiPicker = ({ onChange, value }: EmojiPickerProps) => {
    return (
        <Popover>
            <PopoverTrigger>
                <Smile className='text-zinc-500 dark:text-zinc-400 hover:text-zinc-500 dark:hover:text-zinc-300 transition' />
            </PopoverTrigger>
            <PopoverContent side='right' sideOffset={40} className='border-none bg-transparent mb-16 shadow-none'>
                <Picker data={data} onEmojiSelect={(emoji: any) => onChange(emoji.native)} />
            </PopoverContent>
        </Popover>
    )
}

export default EmojiPicker