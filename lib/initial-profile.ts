import { currentUser, redirectToSignIn } from "@clerk/nextjs";

import { db } from "@/lib/db";

export const initialProfile = async () => {
    const user = await currentUser();

    if (!user) {
        return redirectToSignIn({ returnBackUrl: 'http://localhost:3000/sign-in' });
    }

    const profile = await db.profile.findUnique({
        where: {
            user_id: user.id
        }
    });

    if (profile) {
        return profile;
    }

    const newProfile = await db.profile.create({
        data: {
            user_id: user.id,
            name: `${user.firstName} ${user.lastName}`,
            image_url: user.imageUrl,
            email: user.emailAddresses[0].emailAddress
        }
    });

    return newProfile;
};