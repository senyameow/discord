import { Member, Profile, Server } from "@prisma/client";

export type ServerWithMembersWithProfiles = Server & {
    members: (Member & { profile: Profile })[]
}
// вот так просто можно создать крутой тип, который можно переиспользовать потом очень очень много раз