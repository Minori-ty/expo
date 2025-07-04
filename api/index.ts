import { db } from '@/db'
import {
    animeTable,
    calendarTable,
    EStatus,
    EUpdateWeekday,
    insertAnimeSchema,
    schduleTable,
    upcomingTable,
} from '@/db/schema'
import { generateAnimeData, IGenerateAnimeDataParams } from '@/hooks/useAnime'
import { createCalendarEvent, deleteCalendarEvent } from '@/utils/calendar'
import dayjs from 'dayjs'
import { eq, inArray } from 'drizzle-orm'

interface IBaseParams {
    totalEpisode: number
    name: string
    status: EStatus
    cover: string
    updateTimeHHmm: string
}

interface IAddAnimeParams {
    updateWeekday?: EUpdateWeekday
    currentEpisode?: number
}

export async function addAnime(
    formData: (IBaseParams & Required<IAddAnimeParams>) | (IBaseParams & { firstEpisodeDateTime: number })
) {
    return await db.transaction(async (tx) => {
        let params: IGenerateAnimeDataParams
        // 已完结/未开播 无currentEpisode和currentEpisode
        if ('firstEpisodeDateTime' in formData) {
            const { totalEpisode, name, status, cover, updateTimeHHmm, firstEpisodeDateTime } = formData
            params = {
                totalEpisode,
                name,
                status,
                cover,
                updateTimeHHmm,
                currentEpisode: status === EStatus.COMPLETED ? totalEpisode : 0,
                updateWeekday: dayjs.unix(firstEpisodeDateTime).isoWeekday(),
                firstEpisodeDateTime,
            }
        } else {
            const { totalEpisode, name, status, cover, updateTimeHHmm, updateWeekday, currentEpisode } = formData
            params = {
                totalEpisode,
                name,
                status,
                cover,
                updateTimeHHmm,
                currentEpisode,
                updateWeekday,
            }
        }
        const insertData = generateAnimeData(params)
        const { status } = insertData
        const result = insertAnimeSchema.safeParse(insertData)
        type TData = typeof animeTable.$inferInsert
        if (!result.success) {
            return result.error.message
        }

        const returning = await tx
            .insert(animeTable)
            .values(result.data as TData)
            .returning()
        /** 插入后返回的数据 */
        const animeData = returning[0]
        const { id, name, currentEpisode, lastEpisodeDateTime, firstEpisodeDateTime, totalEpisode } = animeData
        /** 本周开始的时间 */
        const dayStartTimestamp = dayjs().hour(0).minute(0).second(0).millisecond(0).unix()
        if (status === EStatus.ONGOING) {
            await tx
                .insert(schduleTable)
                .values({
                    animeId: id,
                })
                .returning()

            const calendarId = await createCalendarEvent({
                name,
                currentEpisode,
                firstEpisodeDateTime,
                lastEpisodeDateTime,
                totalEpisode,
                status,
            })
            if (calendarId) {
                await tx.insert(calendarTable).values({ calendarId, animeId: animeData.id })
            }
            // 虽然完结了，但是是在本周内完结的，也要插入到更新表中
        } else if (status === EStatus.COMPLETED && lastEpisodeDateTime > dayStartTimestamp) {
            await tx.insert(schduleTable).values({
                animeId: id,
            })
        } else if (status === EStatus.COMING_SOON) {
            await tx.insert(upcomingTable).values({
                animeId: id,
            })

            const calendarId = await createCalendarEvent({
                name,
                currentEpisode,
                firstEpisodeDateTime,
                lastEpisodeDateTime,
                totalEpisode,
                status,
            })
            console.log('创建日历事件', calendarId)

            if (calendarId) {
                await tx.insert(calendarTable).values({ calendarId, animeId: animeData.id })
                console.log('插入日历表')
            }
        }
        return animeData
    })
}

export async function getSchedule() {
    return await db.transaction(async (tx) => {
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
        return parseAnimeList
    })
}

export async function deleteAnime(id: number) {
    return await db.transaction(async (tx) => {
        const result = await tx.select().from(calendarTable).where(eq(calendarTable.animeId, id))
        if (result.length > 0) {
            const calendarId = result[0].calendarId
            await deleteCalendarEvent(calendarId)
        }
        return tx.delete(animeTable).where(eq(animeTable.id, id)).returning()
    })
}
