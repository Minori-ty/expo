import { db } from '@/db'
import { animeTable, calendarTable, EStatus, schduleTable, upcomingTable } from '@/db/schema'
import { deleteCalendarEvent } from '@/utils/calendar'
import { getCurrentEpisode } from '@/utils/timeCalculation'
import dayjs from 'dayjs'
import { eq } from 'drizzle-orm'
import * as BackgroundTask from 'expo-background-task'
import * as TaskManager from 'expo-task-manager'

/** 定时更新动漫更新表和动漫即将更新表 */
const BACKGROUND_TASK_NAME = 'REFRESH_SCHEDULE_AND_CALENDAR'

export function taskDefined() {
    const isTaskDefined = TaskManager.isTaskDefined(BACKGROUND_TASK_NAME)
    if (!isTaskDefined) {
        TaskManager.defineTask(BACKGROUND_TASK_NAME, async () => {
            try {
                await refreshScheduleAndCalendar()
                return BackgroundTask.BackgroundTaskResult.Success
            } catch {
                return BackgroundTask.BackgroundTaskResult.Failed
            }
        })
    }
}

/**
 * 在App初始化时注册任务
 * @returns
 */
export async function registerBackgroundTask() {
    /** 是否注册了任务 */
    const isRegistered = await TaskManager.isTaskRegisteredAsync(BACKGROUND_TASK_NAME)
    if (isRegistered) return
    // 注册任务（iOS/Android 通用 API）
    BackgroundTask.registerTaskAsync(BACKGROUND_TASK_NAME, {
        minimumInterval: 15, // 最少15分钟触发（单位：分钟）
    })
}

/**
 * 刷新动漫更新表和动漫即将更新表
 */
export async function refreshScheduleAndCalendar() {
    db.transaction(async (tx) => {
        const selectSchedule = await tx
            .select()
            .from(schduleTable)
            .leftJoin(animeTable, eq(schduleTable.animeId, animeTable.id))
            .where(eq(schduleTable.animeId, animeTable.id))

        // 1.先更新表数据
        selectSchedule.forEach(async (item) => {
            if (!item.anime) return
            const { firstEpisodeDateTime, totalEpisode, currentEpisode, id } = item.anime
            if (getCurrentEpisode(firstEpisodeDateTime, totalEpisode) > currentEpisode) {
                const updateEpisode = currentEpisode + 1
                await tx.update(animeTable).set({ currentEpisode: updateEpisode }).where(eq(animeTable.id, id))
                if (updateEpisode === totalEpisode) {
                    await tx.update(animeTable).set({ status: EStatus.COMPLETED }).where(eq(animeTable.id, id))
                }
            }
        })

        // 2.删除已完结和过期的动漫数据

        // 更新完数据后，重新获取最新的数据
        const newSelectSchedule = await tx
            .select()
            .from(schduleTable)
            .leftJoin(animeTable, eq(schduleTable.animeId, animeTable.id))
            .where(eq(schduleTable.animeId, animeTable.id))

        newSelectSchedule.forEach((item) => {
            if (!item.anime) return
            const { status, lastEpisodeDateTime } = item.anime
            if (status === EStatus.COMPLETED && lastEpisodeDateTime < dayjs().isoWeekday(1).unix()) {
                tx.delete(schduleTable).where(eq(schduleTable.id, item.schdule.id))
            }
        })

        /** 把达到更新时间的动漫插入到更新表中 */
        const selectUpcoming = await tx
            .select()
            .from(upcomingTable)
            .leftJoin(animeTable, eq(upcomingTable.animeId, animeTable.id))
            .where(eq(upcomingTable.animeId, animeTable.id))

        selectUpcoming.forEach(async (item) => {
            if (!item.anime) return
            const { firstEpisodeDateTime, id } = item.anime
            if (firstEpisodeDateTime < dayjs().unix()) {
                await tx.update(animeTable).set({
                    status: EStatus.ONGOING,
                    currentEpisode: 1,
                })
                await tx.insert(schduleTable).values({
                    animeId: id,
                })
            }
        })

        // 3.删除已过期的日历事件

        const selectCalendar = await tx
            .select()
            .from(calendarTable)
            .leftJoin(animeTable, eq(calendarTable.animeId, animeTable.id))

        selectCalendar.forEach(async (item) => {
            if (!item.anime) return
            const { lastEpisodeDateTime } = item.anime
            if (lastEpisodeDateTime < dayjs().unix()) {
                await deleteCalendarEvent(item.calendar.calendarId)
            }
        })
    })
}
