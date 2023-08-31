// орм штука (т.е. мы не будем юзать supabase в целях квери, instead мы будем юзать саму призму (иначе нах она нужна то))
import { PrismaClient } from '@prisma/client'

declare global {
    var prisma: PrismaClient;
}

export const db = globalThis.prisma || new PrismaClient()  // мы могли просто написать new PrismaClient()
// но зачем тогда этот глобал зис, что это вообще? Он нужен для девелопмент мода
// такой трик, что мы будем писать код, и он не будет рефрешить каждый раз эту херню после каждой строчки кода, что очень бесит
// потому что , когда даты становится много и фетча эта штука начинает тормозить по 10 сек

if (process.env.NODE_ENV !== 'production') globalThis.prisma = db // а вот в продакшене уже будем юзать просто дб

// async function main() {
//     // ... you will write your Prisma Client queries here
// }

// main()
//     .then(async () => {
//         await db.$disconnect()
//     })
//     .catch(async (e) => {
//         console.error(e)
//         await db.$disconnect()
//         process.exit(1)
//     })

// // то же самое, что мы делали с дризлом (более новой штукой и, как говорят, более быстрой и лучшей, но призму все равно надо знать)
