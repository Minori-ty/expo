import { db } from '@/db'
import { animeTable, insertAnimeSchema, schduleTable } from '@/db/schema'
import { TFormData, generateAnimeData, useSelectAnime } from '@/hooks/useAnime'
import dayjs from 'dayjs'
import { eq, inArray } from 'drizzle-orm'

export async function addAnime(formData: TFormData) {
    return await db.transaction(async (tx) => {
        const data = generateAnimeData(formData)
        const result = insertAnimeSchema.safeParse(data)
        type TData = typeof animeTable.$inferInsert
        if (result.success) {
            const returning = await tx
                .insert(animeTable)
                .values(result.data as TData)
                .returning()
            const animeData = returning[0]
            if (!data.isFinished) {
                await tx.insert(schduleTable).values({
                    animeId: animeData.id,
                })
            }
        } else {
            console.log('插入数据验证失败:', result.error)
            new Error(result.error.message)
        }
    })
}

export async function getSchedule(): Promise<ReturnType<typeof useSelectAnime>> {
    return new Promise(async (resolve, reject) => {
        await db.transaction(async (tx) => {
            const scheduleList = await tx.select().from(schduleTable)
            const animeIdList = scheduleList.map((item) => item.animeId)
            const animeList = tx.select().from(animeTable).where(inArray(animeTable.id, animeIdList)).all()
            const parseAnimeList = animeList.map((item) => {
                return {
                    ...item,
                    firstEpisodeDateTime: dayjs.unix(item.firstEpisodeDateTime).format('YYYY-MM-DD HH:mm'),
                    lastEpisodeDateTime: dayjs.unix(item.lastEpisodeDateTime).format('YYYY-MM-DD HH:mm'),
                    createdAt: dayjs.unix(item.createdAt).format('YYYY-MM-DD HH:mm'),
                }
            })
            resolve(parseAnimeList)
        })
    })
}

export async function deleteAnime(id: number) {
    db.transaction(async (tx) => {
        await tx.delete(animeTable).where(eq(animeTable.id, id))
        const returning = await tx.select().from(schduleTable).where(eq(schduleTable.animeId, id))
        if (returning.length) {
            const schedule = returning[0]
            tx.delete(schduleTable).where(eq(schduleTable.id, schedule.id))
        }
    })
}
