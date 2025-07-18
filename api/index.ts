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
import { generateAnimeData } from '@/hooks/useAnime'
import { createCalendarEvent, deleteCalendarEvent } from '@/utils/calendar'
import { firstEpisodeInThisWeek } from '@/utils/timeCalculation'
import dayjs from 'dayjs'
import { eq, ExtractTablesWithRelations, inArray } from 'drizzle-orm'
import { SQLiteTransaction } from 'drizzle-orm/sqlite-core'
import { SQLiteRunResult } from 'expo-sqlite'
import type { DeepExpand } from 'types-tools'

interface IBaseParams {
    totalEpisode: number
    name: string
    cover: string
    updateTimeHHmm: string
    status: EStatus
}

interface IAddAnimeParams {
    updateWeekday?: EUpdateWeekday
    currentEpisode?: number
}

type TOngoingFormData = DeepExpand<IBaseParams & Required<IAddAnimeParams>>
type TCompleteFormData = DeepExpand<IBaseParams & { firstEpisodeDateTime: number }>
export type TFormData = TOngoingFormData | TCompleteFormData
export async function addAnime(formData: TFormData) {
    return await db.transaction(async tx => {
        return await onAddAnime(tx, formData)
    })
}

export async function getSchedule() {
    return await db.transaction(async tx => {
        const scheduleList = await tx.select().from(schduleTable)
        const animeIdList = scheduleList.map(item => item.animeId)
        const animeList = tx.select().from(animeTable).where(inArray(animeTable.id, animeIdList)).all()
        const parseAnimeList = animeList.map(item => {
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
    return await db.transaction(async tx => {
        await onDeleteAnime(tx, id)
    })
}

export async function updateAnime(formData: TFormData & { id: number }) {
    await db.transaction(async tx => {
        const animeList = await tx.update(animeTable).set(formData).where(eq(animeTable.id, formData.id)).returning()
        if (animeList.length === 0) {
            console.log('找不到动漫')
            return
        }
        // 更新动漫数据
        await tx.update(animeTable).set(formData).where(eq(animeTable.id, formData.id))

        // 更新日历
        await updateCalendar(tx, formData.id, formData)

        // 更新追番时间表
        await updateSchedule(tx, formData.id, formData)

        // 更新即将更新表
        await updateComingSoon(tx, formData.id, formData)
    })
}

type TTx = SQLiteTransaction<
    'sync',
    SQLiteRunResult,
    Record<string, never>,
    ExtractTablesWithRelations<Record<string, never>>
>

async function onAddAnime(tx: TTx, formData: TFormData) {
    const insertData = generateAnimeData(formData)
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

        if (firstEpisodeInThisWeek(firstEpisodeDateTime)) {
            await tx.insert(schduleTable).values({
                animeId: id,
            })
        }
    }
    return animeData
}

async function onDeleteAnime(tx: TTx, id: number) {
    const result = await tx.select().from(calendarTable).where(eq(calendarTable.animeId, id))
    if (result.length > 0) {
        const calendarId = result[0].calendarId
        await deleteCalendarEvent(calendarId)
    }
    return tx.delete(animeTable).where(eq(animeTable.id, id)).returning()
}

async function deleteCalendar(tx: TTx, animeId: number) {
    const calendarList = await tx.select().from(calendarTable).where(eq(calendarTable.animeId, animeId))
    if (calendarList.length === 0) return
    const calendar = calendarList[0]
    await deleteCalendarEvent(calendar.calendarId)
    await tx.delete(calendarTable).where(eq(calendarTable.animeId, animeId))
}

async function createCalendar(tx: TTx, animeId: number, formData: TFormData) {
    const { name, currentEpisode, firstEpisodeDateTime, lastEpisodeDateTime, totalEpisode, status } =
        generateAnimeData(formData)
    const calendarId = await createCalendarEvent({
        name,
        currentEpisode,
        firstEpisodeDateTime,
        lastEpisodeDateTime,
        totalEpisode,
        status,
    })
    console.log('创建时间到系统日历成功', calendarId)

    if (calendarId) {
        await tx.insert(calendarTable).values({ calendarId, animeId: animeId })
        console.log('插入数据到日历表成功')
    }
}

async function updateCalendar(tx: TTx, animeId: number, formData: TFormData) {
    // 先删除旧的日历
    await deleteCalendar(tx, animeId)
    // 再创建新日历
    await createCalendar(tx, animeId, formData)
}

async function updateSchedule(tx: TTx, animeId: number, formData: TFormData) {
    const { status, firstEpisodeDateTime } = generateAnimeData(formData)
    if (status === EStatus.COMPLETED) {
        const scheduleList = await tx.select().from(schduleTable).where(eq(schduleTable.animeId, animeId))
        if (scheduleList.length !== 0) {
            await tx.delete(schduleTable).where(eq(schduleTable.animeId, animeId))
            return
        }
    }

    if (status === EStatus.ONGOING) {
        const scheduleList = await tx.select().from(schduleTable).where(eq(schduleTable.animeId, animeId))
        if (scheduleList.length === 0) {
            await tx.insert(schduleTable).values({ animeId })
            return
        }
    }

    if (status === EStatus.COMING_SOON) {
        if (firstEpisodeInThisWeek(firstEpisodeDateTime)) {
            await tx.insert(schduleTable).values({ animeId })
            return
        }
    }
}

async function updateComingSoon(tx: TTx, animeId: number, formData: TFormData) {
    const { status } = generateAnimeData(formData)
    if (status !== EStatus.COMING_SOON) {
        await tx.delete(upcomingTable).where(eq(upcomingTable.animeId, animeId))
    }
}
