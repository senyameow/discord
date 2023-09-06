import { Menu } from 'lucide-react'
import React from 'react'

import {
    Sheet,
    SheetContent,
    SheetDescription,
    SheetHeader,
    SheetTitle,
    SheetTrigger,
} from '@/components/ui/sheet'
import { Button } from './ui/button'
import NavigationSidebar from './navigation/navigation-sidebar'
import ServerSidebar from './server/ServerSidebar'

const MobileToggle = ({ serverId }: { serverId: string }) => {
    return (
        <Sheet>
            <SheetTrigger asChild>
                <Button variant={'ghost'} className='md:hidden' size={'icon'}>
                    <Menu />
                </Button>
            </SheetTrigger >
            <SheetContent className='p-0 flex gap-0' side={'left'}>
                <div className='w-[72px]'>
                    <NavigationSidebar />
                </div>
                <ServerSidebar serverId={serverId} />

            </SheetContent>
        </Sheet>
    )
}

export default MobileToggle