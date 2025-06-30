import { getCalendarPermission } from '@/permissions'
import * as Calendar from 'expo-calendar'

export async function createCalendarEvent(title: string, startDate: Date, endDate: Date) {
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

    const eventId = await Calendar.createEventAsync(defaultCalendar.id, {
        title,
        startDate,
        endDate,
        timeZone: 'Asia/Shanghai',
        alarms: [
            { relativeOffset: -5 }, // 提前10分钟通知
        ],
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
