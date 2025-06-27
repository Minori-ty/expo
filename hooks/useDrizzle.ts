import { db } from '@/db'
import { animeTable, insertAnimeSchema } from '@/db/schema'
import dayjs from 'dayjs'
import { z } from 'zod/v4'

const insertAnimeData = insertAnimeSchema
    .omit({ id: true, createdAt: true, isFinished: true, firstEpisodeDateTime: true, lastEpisodeDateTime: true })
    .extend({})
type TFormData = z.infer<typeof insertAnimeData>

export function insertAnime(formData: TFormData) {
    return new Promise(async (resolve, reject) => {
        // 获取当前日期
        const now = dayjs()

        // 判断是否已过本周更新时间
        const isUpdated = hasEpisodeUpdated(formData.updateWeekday, formData.updateTimeHHmm)
        // 解析更新时间（时和分）
        const [hours, minutes] = formData.updateTimeHHmm.split(':').map(Number)

        // 构建本周更新时间点
        let updateDateTime = now.day(formData.updateWeekday).hour(hours).minute(minutes).second(0).millisecond(0)

        // 根据是否已更新调整集数和日期
        let effectiveEpisode = formData.currentEpisode
        if (!isUpdated) {
            // 还没到本周更新时间，使用上周的集数
            effectiveEpisode = formData.currentEpisode - 1
            // 将更新时间调整到上周
            updateDateTime = updateDateTime.subtract(1, 'week')
        }

        // 计算第一集的日期时间
        const firstEpisodeDateTime = updateDateTime.subtract((effectiveEpisode - 1) * 7, 'day')
        const lastEpisodeDateTime = firstEpisodeDateTime.add((formData.totalEpisode - 1) * 7, 'day')
        // 判断是否完结：当前时间是否晚于最后一集更新时间
        const isFinished = now.isAfter(lastEpisodeDateTime)

        const data: z.infer<typeof insertAnimeSchema> = {
            ...formData,
            createdAt: dayjs().unix(),
            firstEpisodeDateTime: firstEpisodeDateTime.unix(),
            lastEpisodeDateTime: lastEpisodeDateTime.unix(),
            isFinished,
        }
        const result = insertAnimeSchema.safeParse(data)
        type TData = typeof animeTable.$inferInsert
        if (result.success) {
            const data = await db.insert(animeTable).values(result.data as TData)
            resolve(data)
        } else {
            reject(result.error)
            console.log('插入数据验证失败:', result.error)
        }
    })
}

/**
 * 判断当前时间是否已过本周的更新时间点
 * @param  updateDay - 更新星期几（1-7，1表示周一）
 * @param  updateTime - 更新时间，格式为HH:mm
 * @returns  - 已过返回true，未过返回false
 */
function hasEpisodeUpdated(updateDay: number, updateTime: string): boolean {
    // 解析更新时间（时和分）
    const [hours, minutes] = updateTime.split(':').map(Number)
    if (isNaN(hours) || isNaN(minutes) || hours < 0 || hours > 23 || minutes < 0 || minutes > 59) {
        throw new Error('更新时间格式无效，应为HH:mm')
    }

    // 获取当前时间
    const now = dayjs()

    // 构建本周更新时间点
    const updateDateTime = now.day(updateDay).hour(hours).minute(minutes).second(0).millisecond(0)

    // 判断当前时间是否已过更新时间点
    return now.isAfter(updateDateTime)
}
