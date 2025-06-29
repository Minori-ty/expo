import type { TFormData } from '@/app/addAnime'
import { db } from '@/db'
import { animeTable, insertAnimeSchema } from '@/db/schema'
import { getFirstEpisodeDateTime, getlastEpisodeDateTime } from '@/utils/timeCalculation'
import dayjs from 'dayjs'
import { eq, inArray } from 'drizzle-orm'
import { z } from 'zod/v4'

export const formDataSchema = insertAnimeSchema.omit({ id: true })
/**
 * 生成表数据
 * @param formData 表单数据
 * @returns
 */
export function generateAnimeData(formData: TFormData) {
    const { updateTimeHHmm, updateWeekday, currentEpisode, totalEpisode } = formData
    const now = dayjs()
    // 计算第一集的日期时间
    const firstEpisodeDateTime = getFirstEpisodeDateTime(updateTimeHHmm, updateWeekday, currentEpisode)
    const lastEpisodeDateTime = getlastEpisodeDateTime(updateTimeHHmm, updateWeekday, currentEpisode, totalEpisode)
    // 判断是否完结：当前时间是否晚于最后一集更新时间
    const isFinished = now.isAfter(lastEpisodeDateTime)
    const data: z.infer<typeof formDataSchema> = {
        ...formData,
        createdAt: dayjs().unix(),
        firstEpisodeDateTime: firstEpisodeDateTime.unix(),
        lastEpisodeDateTime: lastEpisodeDateTime.unix(),
        isFinished,
    }

    return data
}

/**
 * 查询全部
 * @returns
 */
export async function selectAnime() {
    const row = await db.select().from(animeTable)
    return row.map((item) => {
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
 * @param idList 动漫的id列表
 * @returns
 */
export async function selectAnimeById(id: number) {
    const result = await db.select().from(animeTable).where(eq(animeTable.id, id))
    const data = result.map((item) => {
        return {
            ...item,
            firstEpisodeDateTime: dayjs.unix(item.firstEpisodeDateTime).format('YYYY-MM-DD HH:mm'),
            lastEpisodeDateTime: dayjs.unix(item.lastEpisodeDateTime).format('YYYY-MM-DD HH:mm'),
            createdAt: dayjs.unix(item.createdAt).format('YYYY-MM-DD HH:mm'),
        }
    })
    return data[0]
}
/**
 *
 * @param idList 动漫的id列表
 * @returns
 */
export async function selectAnimeByIdList(idList: number[]) {
    const row = db.select().from(animeTable).where(inArray(animeTable.id, idList)).all()
    return row.map((item) => {
        return {
            ...item,
            firstEpisodeDateTime: dayjs.unix(item.firstEpisodeDateTime).format('YYYY-MM-DD HH:mm'),
            lastEpisodeDateTime: dayjs.unix(item.lastEpisodeDateTime).format('YYYY-MM-DD HH:mm'),
            createdAt: dayjs.unix(item.createdAt).format('YYYY-MM-DD HH:mm'),
        }
    })
}

export async function deleteAnime(id: number) {
    return await db.delete(animeTable).where(eq(animeTable.id, id))
}
