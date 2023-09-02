'use client'
import { Plus } from "lucide-react"
import { ActionTooltip } from "./action-tooltip"
import { useModal } from "../hooks/use-modal-store"


export const NavigationAction = () => {

    const { onOpen } = useModal()


    return (
        <div>
            <ActionTooltip label="add a server" align="center" side="right">

                <button className="group" onClick={() => onOpen('createServer')}>
                    <div className="transition-all duration-100 flex mx-3 justify-center items-center w-[48px] h-[48px] rounded-full group-hover:rounded-[18px] overflow-hidden bg-background dark:bg-neutral-700 group-hover:bg-emerald-500 ">
                        <Plus className="text-emerald-500 group-hover:text-white" size={25} />
                    </div>
                </button>
            </ActionTooltip>

        </div>
    )
}