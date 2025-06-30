import { getCalendarPermission } from '@/permissions'
import dayjs from 'dayjs'
import * as Calendar from 'expo-calendar'

export async function createCalendarEvent({
    name,
    currentEpisode,
    firstEpisodeDateTime,
    lastEpisodeDateTime,
}: {
    name: string
    currentEpisode: number
    firstEpisodeDateTime: number
    lastEpisodeDateTime: number
}) {
    // 先获取日历权限
    const granted = await getCalendarPermission()
    if (!granted) return

    // 获得默认日历ID
    const calendars = await Calendar.getCalendarsAsync()
    const defaultCalendar = calendars.find((cal) => cal.allowsModifications)

    if (!defaultCalendar) {
        console.log('没有找到可修改的默认日历')
        return
    }
    const day = dayjs.unix(firstEpisodeDateTime)
    const weekday = day.isoWeekday()
    const hours = day.hour()
    const minutes = day.minute()
    // 解析输入的时间字符串
    const eventId = await Calendar.createEventAsync(defaultCalendar.id, {
        title: `${name} 第${currentEpisode + 1}集 即将更新!`,
        startDate: dayjs().isoWeekday(weekday).hour(hours).minute(minutes).toDate(),
        endDate: dayjs().isoWeekday(weekday).hour(hours).minute(minutes).toDate(),
        timeZone: 'Asia/Shanghai',
        alarms: [
            { relativeOffset: -5 }, // 提前10分钟通知
        ],
        // recurrenceRule: {
        //     // frequency: Calendar.Frequency.WEEKLY,
        // },
    })
    return eventId
}

// 删除日历事件
export async function deleteCalendarEvent(eventId: string) {
    // 先获取日历权限
    const granted = await getCalendarPermission()
    if (!granted) return

    // 获得默认日历ID
    const calendars = await Calendar.getCalendarsAsync()
    const defaultCalendar = calendars.find((cal) => cal.allowsModifications)

    if (!defaultCalendar) {
        console.log('没有找到可修改的默认日历')
        return
    }

    // 删除事件
    const success = await Calendar.deleteEventAsync(eventId)

    return success
}
