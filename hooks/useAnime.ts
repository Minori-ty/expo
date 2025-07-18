import { TFormData } from '@/api'
import { db } from '@/db'
import { animeTable, EStatus, EUpdateWeekday, insertAnimeSchema } from '@/db/schema'
import { getFirstEpisodeDateTime, getlastEpisodeDateTime } from '@/utils/timeCalculation'
import dayjs from 'dayjs'
import { eq } from 'drizzle-orm'
import { z } from 'zod/v4'

export const formDataSchema = insertAnimeSchema.omit({ id: true })

export interface IGenerateAnimeDataParams {
    updateTimeHHmm: string
    updateWeekday: EUpdateWeekday
    currentEpisode: number
    totalEpisode: number
    name: string
    status: EStatus
    cover: string
    firstEpisodeDateTime?: number
}

/**
 * 生成表数据
 * @param formData 表单数据
 * @returns
 */
export function generateAnimeData(formData: TFormData) {
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
    const { updateTimeHHmm, updateWeekday, currentEpisode, totalEpisode } = params
    // 计算第一集的日期时间
    const firstEpisodeDateTime = params.firstEpisodeDateTime
        ? dayjs.unix(params.firstEpisodeDateTime)
        : getFirstEpisodeDateTime(updateTimeHHmm, updateWeekday, currentEpisode)
    const lastEpisodeDateTime = params.firstEpisodeDateTime
        ? firstEpisodeDateTime.add((totalEpisode - 1) * 7, 'day')
        : getlastEpisodeDateTime(updateTimeHHmm, updateWeekday, currentEpisode, totalEpisode)

    const data: z.infer<typeof formDataSchema> = {
        ...params,
        createdAt: dayjs().unix(),
        firstEpisodeDateTime: firstEpisodeDateTime.unix(),
        lastEpisodeDateTime: lastEpisodeDateTime.unix(),
    }

    return data
}

/**
 * 查询全部
 * @returns
 */
export async function selectAnime() {
    const row = await db.select().from(animeTable)
    return row.map(item => {
        return {
            ...item,
            firstEpisodeDateTime: dayjs.unix(item.firstEpisodeDateTime).format('YYYY-MM-DD HH:mm'),
            lastEpisodeDateTime: dayjs.unix(item.lastEpisodeDateTime).format('YYYY-MM-DD HH:mm'),
            createdAt: dayjs.unix(item.createdAt).format('YYYY-MM-DD HH:mm'),
        }
    })
}

/**
 *
 * @param id 动漫的id
 * @returns
 */
export async function selectAnimeById(id: number) {
    const result = await db.select().from(animeTable).where(eq(animeTable.id, id))
    const data = result.map(item => {
        return {
            ...item,
            firstEpisodeDateTime: dayjs.unix(item.firstEpisodeDateTime).format('YYYY-MM-DD HH:mm'),
            lastEpisodeDateTime: dayjs.unix(item.lastEpisodeDateTime).format('YYYY-MM-DD HH:mm'),
            createdAt: dayjs.unix(item.createdAt).format('YYYY-MM-DD HH:mm'),
        }
    })
    return data[0]
}
