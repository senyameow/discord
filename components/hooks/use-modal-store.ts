// зачем нам этот стор? он для модалок, сюда мы положим функции для открытия и закрытия модалок, стейты и т.д. если понадобится еще что-то
// также мы можем сразу задать много типов модалок и просто потом при вызове стора указывать тип модалки

import { ServerWithMembersWithProfiles } from '@/types';
import { Server } from 'http';
import { create } from 'zustand'

export type ModalType = 'createServer' | 'invite' | 'editServer' | 'manage'

interface ModalData {
    server?: ServerWithMembersWithProfiles
} // для инвайтов
interface ModalStore {
    type: ModalType | null; // сторим тип модалки
    data: ModalData;
    isOpen: boolean;
    onClose: () => void;
    onOpen: (type: ModalType, data?: ModalData) => void; // и остальные базовые стейты
}


export const useModal = create<ModalStore>((set) => ({
    type: null,
    data: {},
    isOpen: false,
    onOpen: (type, data = {}) => set({ isOpen: true, type, data }), // описываем поведение функции с помощью сета (прокидываем объект и там указываем, что меняется)
    // в нашем случае надо изменять состояние стейта isOpen на true, и прокидывать тип (чтобы открывалась правильная модалка)
    onClose: () => set({ isOpen: false, type: null, data: {} })
}))

// теперь можем идти создавать саму модалку