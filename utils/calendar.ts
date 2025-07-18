import { EStatus } from '@/db/schema'
import { getCalendarPermission } from '@/permissions'
import dayjs from 'dayjs'
import * as Calendar from 'expo-calendar'
import { isCurrentWeekdayUpdateTimePassed } from './timeCalculation'

function getstartDate(firstEpisodeDateTime: number, status: EStatus) {
    const day = dayjs.unix(firstEpisodeDateTime)
    const weekday = day.isoWeekday()
    const hours = day.hour()
    const minutes = day.minute()

    const firstDateTime = status === EStatus.ONGOING ? dayjs().isoWeekday(weekday).hour(hours).minute(minutes) : day
    if (isCurrentWeekdayUpdateTimePassed(day.format('HH:mm'), weekday)) {
        return firstDateTime.add(7, 'day').toDate()
    }
    return firstDateTime.toDate()
}

export async function createCalendarEvent({
    name,
    firstEpisodeDateTime,
    totalEpisode,
    currentEpisode,
    status,
}: {
    name: string
    currentEpisode: number
    firstEpisodeDateTime: number
    lastEpisodeDateTime: number
    totalEpisode: number
    status: EStatus
}) {
    // 先获取日历权限
    const granted = await getCalendarPermission()
    if (!granted) return

    // 获得默认日历ID
    const calendars = await Calendar.getCalendarsAsync()
    const defaultCalendar = calendars.find(cal => cal.allowsModifications)

    if (!defaultCalendar) {
        console.log('没有找到可修改的默认日历')
        return
    }
    const day = dayjs.unix(firstEpisodeDateTime)
    const weekday = day.isoWeekday()
    const hours = day.hour()
    const minutes = day.minute()
    const startDate = getstartDate(firstEpisodeDateTime, status)
    const endDate =
        status === EStatus.ONGOING
            ? dayjs().isoWeekday(weekday).hour(hours).minute(minutes).add(24, 'minute').toDate()
            : day.add(24, 'minute').toDate()

    // 解析输入的时间字符串
    try {
        const eventId = await Calendar.createEventAsync(defaultCalendar.id, {
            title: `${name} 即将更新!`,
            startDate,
            endDate,
            timeZone: 'Asia/Shanghai',
            alarms: [
                { relativeOffset: -5 }, // 提前10分钟通知
            ],
            recurrenceRule: {
                frequency: Calendar.Frequency.WEEKLY,
                interval: 1,
                occurrence: totalEpisode - currentEpisode,
            },
        })
        return eventId
    } catch (error) {
        alert(error)
        return ''
    }
}

// 删除日历事件
export async function deleteCalendarEvent(eventId: string) {
    // 先获取日历权限
    const granted = await getCalendarPermission()
    if (!granted) return false

    // 获得默认日历ID
    const calendars = await Calendar.getCalendarsAsync()
    const defaultCalendar = calendars.find(cal => cal.allowsModifications)

    if (!defaultCalendar) {
        console.log('没有找到可修改的默认日历')
        return false
    }

    try {
        await Calendar.deleteEventAsync(eventId)
        console.log('删除日历成功')
        return true
    } catch {
        return false
    }
}
