import { db } from '@/db'
import { animeTable, schduleTable, upcomingTable } from '@/db/schema'
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
        const allSchedule = await tx
            .select()
            .from(schduleTable)
            .leftJoin(animeTable, eq(schduleTable.animeId, animeTable.id))
            .where(eq(schduleTable.animeId, animeTable.id))
        /** 需要删除的动漫更新记录 */
        const deleteScheduleList = allSchedule.filter((schedule) => {
            if (!schedule.anime) return true
            const nowTimestamp = dayjs().unix()
            if (schedule.anime.lastEpisodeDateTime < nowTimestamp) return true
        })
        deleteScheduleList.forEach(async (item) => {
            await tx.delete(schduleTable).where(eq(schduleTable.id, item.schdule.id))
        })
        /** 更新currentEpisode */
        const remainingSchedules = allSchedule.filter((schedule) => !deleteScheduleList.includes(schedule))
        remainingSchedules.forEach(async (item) => {
            if (!item.anime) return
            await tx
                .update(animeTable)
                .set({ currentEpisode: getCurrentEpisode(item.anime.firstEpisodeDateTime, item.anime.totalEpisode) })
                .where(eq(animeTable.id, item.anime.id))
        })

        /** 把达到更新时间的动漫插入到更新表中 */
        const upcomingList = await tx
            .select()
            .from(upcomingTable)
            .leftJoin(animeTable, eq(upcomingTable.animeId, animeTable.id))
            .where(eq(upcomingTable.animeId, animeTable.id))

        upcomingList.forEach(async (item) => {
            if (!item.anime) return
            if (item.anime.firstEpisodeDateTime < dayjs().unix()) {
                await tx.insert(schduleTable).values({
                    animeId: item.anime.id,
                })
            }
        })

        // const calendarList = await tx
        //     .select()
        //     .from(calendarTable)
        //     .leftJoin(animeTable, eq(calendarTable.animeId, animeTable.id))
        //     .where(eq(calendarTable.animeId, animeTable.id))

        // const calendarMapScheduleId = calendarList.map((item) => item.calendar.scheduleId)

        // // 找出没有注册日历事件的动漫更新记录，注册日历事件
        // allSchedule.forEach(async (item) => {
        //     if (!item.anime) return
        //     if (!calendarMapScheduleId.includes(item.schdule.id)) {
        //         const calendarId = await createCalendarEvent({
        //             name: item.anime.name,
        //             currentEpisode: item.anime.currentEpisode,
        //             updateTimeHHmm: item.anime.updateTimeHHmm,
        //             updateWeekday: item.anime.updateWeekday,
        //         })
        //         if (calendarId) {
        //             await tx
        //                 .insert(calendarTable)
        //                 .values({ calendarId, scheduleId: item.schdule.id, animeId: item.anime.id })
        //         }
        //     }
        // })

        // /** 删除已经通知的日历事件 */
        // calendarList.forEach(async (item) => {
        //     if (!item.anime) return
        //     if (isCurrentWeekdayUpdateTimePassed(item.anime.updateTimeHHmm, item.anime.updateWeekday)) {
        //         await tx.delete(calendarTable).where(eq(calendarTable.id, item.calendar.id))
        //     }
        // })
    })
}
