import ChatHeader from '@/components/chat/ChatHeader';
import { getConversation } from '@/lib/conversation';
import { currentProfile } from '@/lib/current-profile';
import { db } from '@/lib/db';
import { redirectToSignIn } from '@clerk/nextjs';
import { redirect } from 'next/navigation';
import React from 'react'

interface MemberIdPageProps { // что мне нужно получать на этой страничке?
    // 100% надо получать айдишники мемберов, чтобы либо найти, либо создать диалог
    // но откуда они будут приходить?
    // на эту страничку, нас пушит, когда мы нажимаем на чувака (пушит через его айди!)
    // тогда мы можем взять свое айди через currentProfile и взять айди этого чувака через парамсы
    // + нужен айди сервака
    params: {
        serverId: string;
        memberId: string;

    }

}

const MemberIdPage = async ({ params }: MemberIdPageProps) => {

    const profile = await currentProfile()

    if (!profile) return redirectToSignIn()

    const currentMember = await db.member.findFirst({
        where: {
            serverId: params.serverId, // мембер должен быть на этом серваке 
            profileId: profile.id  // + это должен быть тот чувак, который зарегался
            //  по айдишнику профиля у нас привязан сам профиль чувака, значит мы просто инклюдим еще и профак
        },
        include: {
            profile: true // так мы получим всю дату о юзере
        }
    })

    if (!currentMember) return redirect('/') // ретёрним, дальше нам идти не надо

    const conversation = await getConversation(currentMember.id, params.memberId) // и юзаем утилку, которая в любом случае вернет какой-то диалог, если нажали на юзера

    if (!conversation) return redirect(`/servers/${params.serverId}`)

    const { memberOne, memberTwo } = conversation // забираем профили юзеров с диалога
    // и это сразу нам дает нас (memberOne) и другого типа memberTwo

    return (
        <div className='bg-white dark:bg-[#313338] flex flex-col h-full'>
            <ChatHeader image_url={memberTwo.profile.image_url} name={memberTwo.profile.name} serverId={params.serverId} type='conversation' />
        </div>
    )
}

export default MemberIdPage