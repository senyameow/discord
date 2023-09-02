import { currentProfile } from "@/lib/current-profile";
import { db } from "@/lib/db";
import { redirect } from "next/navigation";
import { NavigationAction } from "./navigation-action";
import { Separator } from "../ui/separator";
import { ScrollArea } from "../ui/scroll-area";
import { NavItem } from "./NavItem";
import { ModeToggle } from "../mode-toggle";
import { UserButton } from "@clerk/nextjs";
const NavigationSidebar = async () => {

    const profile = await currentProfile() // если нет зареганного юзера, то отправляем его на / а оттуда его уже потащат регаться

    if (!profile) return redirect('/')

    const servers = await db.server.findMany({
        where: {
            members: {
                some: {
                    profileId: profile.id
                }
            }
        }
    }) // в табличке серверов найди такие, где в колонке members есть хотя бы 1 профайл айди чувака, который сейчас зареган

    // так мы получаем все сервера, нашего юзера

    // очень классная есть штука - элемент tooltip (shadcn), при всяких наводках мышкой или нажатиях окошочки сверху попап 


    return (
        <div className="space-y-4 flex flex-col items-center h-full text-primary dark:bg-[#1E1F22] w-full py-3">
            {/* сделаем кнопку добавления сервера сверху */}
            <NavigationAction />
            <Separator className="h-[2px] bg-zinc-700 w-10 rounded-md" /> {/* классная штука разделитель без всяких дивов */}
            <ScrollArea className="flex-1 w-full flex flex-col gap-3">
                {servers.map(server => (
                    <div className="text-center" key={server.id}>
                        <NavItem id={server.id} name={server.name} image_url={server.image_url} />
                    </div>
                ))}
            </ScrollArea>

            <div className="flex flex-col items-center pb-3 gap-3">
                <ModeToggle />
                <UserButton
                    afterSignOutUrl="/"
                    appearance={{
                        elements: {
                            avatarBox: 'h-[48px] w-[48px]'
                        }
                    }}
                />
            </div>

        </div>
    )
}

export default NavigationSidebar;