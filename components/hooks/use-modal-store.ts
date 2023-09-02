// зачем нам этот стор? он для модалок, сюда мы положим функции для открытия и закрытия модалок, стейты и т.д. если понадобится еще что-то
// также мы можем сразу задать много типов модалок и просто потом при вызове стора указывать тип модалки

import { create } from 'zustand'

export type ModalType = 'createServer'

interface ModalStore {
    type: ModalType | null; // сторим тип модалки
    isOpen: boolean;
    onClose: () => void;
    onOpen: (type: ModalType) => void; // и остальные базовые стейты
}

export const useModal = create<ModalStore>((set) => ({
    type: null,
    isOpen: false,
    onOpen: (type) => set({ isOpen: true, type }), // описываем поведение функции с помощью сета (прокидываем объект и там указываем, что меняется)
    // в нашем случае надо изменять состояние стейта isOpen на true, и прокидывать тип (чтобы открывалась правильная модалка)
    onClose: () => set({ isOpen: false, type: null })
}))

// теперь можем идти создавать саму модалку