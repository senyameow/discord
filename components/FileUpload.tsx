'use client'
import React from 'react'
import { UploadDropzone } from '@/lib/uploadthing'

import '@uploadthing/react/styles.css'


// теперь надо забрать картинку с хранилища (как?)

import { FileIcon, X } from 'lucide-react'
import Image from 'next/image'

interface FileUploadProps {
    endpoint: "messageFile" | "serverImage"
    value: string;
    onChange: (url?: string) => void
}

// оооо какую классную штуку можно сделать!!

// когда мы загрузили картинку, то рендерим не дропзон а саму эту картинку!!!!



const FileUpload = ({ endpoint, value, onChange }: FileUploadProps) => {

    // нам надо получить тип файла


    const fileType = value.split('.').pop() // в валью мы прокидываем значение поля (строка юрл картинки), сплитом разбиваем по точкам, и попом достаем последний элемент массива - расширение

    if (fileType !== 'pdf' && value) {
        return (
            <div className='h-28 w-28 relative'>
                <Image src={value} alt='server image' fill className='rounded-full' />
                <button onClick={() => onChange('')} className='absolute top-0 right-0 rounded-full p-1 shadow-lg shadow-gray-400 bg-red-500'>
                    <X className=' w-4 h-4 text-white' type='button' />
                </button> {/* с помощью такой ерунды как onChange мы можем убирать эту фотку и вставлять другую (просто пропихиваем пустую строчку, что заменяет наш линк картинки на пустую строку) */}
            </div>
        )
    }

    if (fileType === 'pdf' && value) {
        return (
            <div className='relative bg-black/10 flex items-center'>
                <FileIcon />
                <a href={value} className='' target='_blank' rel='noopener noreferrer'></a>
            </div>
        )
    }

    console.log(fileType)


    return (
        <UploadDropzone endpoint={endpoint} onUploadError={(error: Error) => { console.log(error) }} onClientUploadComplete={(res) => {
            onChange(res?.[0].url)
        }} />

    )
}

export default FileUpload