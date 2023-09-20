import { MediaRoom } from '@/components/MediaRoom';
import ChatHeader from '@/components/chat/ChatHeader';
import ChatInput from '@/components/chat/ChatInput';
import ChatMessages from '@/components/chat/ChatMessages';
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

    },
    searchParams: {
        video?: boolean;
        audio?: boolean;
    }

}

const MemberIdPage = async ({
    params,
    searchParams,
}: MemberIdPageProps) => {
    const profile = await currentProfile();

    if (!profile) {
        return redirectToSignIn();
    }

    const currentMember = await db.member.findFirst({
        where: {
            serverId: params.serverId,
            profileId: profile.id,
        },
        include: {
            profile: true,
        },
    });

    if (!currentMember) {
        return redirect("/");
    }

    const conversation = await getConversation(currentMember.id, params.memberId);


    if (!conversation) {
        return redirect(`/servers/${params.serverId}`);
    }

    const { memberOne, memberTwo } = conversation;

    const otherMember = memberOne.profileId === profile.id ? memberTwo : memberOne;

    return (
        <div className="bg-white dark:bg-[#313338] flex flex-col h-full">
            <ChatHeader
                image_url={otherMember.profile.image_url}
                name={otherMember.profile.name}
                serverId={params.serverId}
                type="conversation"
            />
            {searchParams.video && (
                <MediaRoom
                    serverId={params.serverId}

                    chatId={conversation.id}
                    video={true}
                    audio={true}
                />
            )}
            {searchParams.audio && (
                <MediaRoom
                    chatId={conversation.id}
                    video={false}
                    audio={true}
                    serverId={params.serverId}
                />
            )}
            {!searchParams.video && !searchParams.audio && (
                <>
                    <ChatMessages
                        member={currentMember}
                        name={otherMember.profile.name}
                        chatId={conversation.id}
                        type="conversation"
                        apiUrl="/api/direct-messages"
                        paramKey="conversationId"
                        paramValue={conversation.id}
                        socketUrl="/api/socket/direct-messages"
                        socketQuery={{
                            conversationId: conversation.id,
                        }}
                    />
                    <ChatInput
                        name={otherMember.profile.name}
                        type="conversation"
                        apiUrl="/api/socket/direct-messages"
                        query={{
                            conversationId: conversation.id,
                        }}
                    />
                </>
            )}
        </div>
    );
}


export default MemberIdPage