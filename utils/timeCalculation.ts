import dayjs from 'dayjs'
import isoWeek from 'dayjs/plugin/isoWeek'
import 'dayjs/plugin/localizedFormat'
import weekday from 'dayjs/plugin/weekday'

dayjs.extend(isoWeek)
dayjs.extend(weekday)

/**
 * 判断是否到了本周的更新时间
 * @param updateTimeHHmm 更新时间(HH:mm)
 * @param updateWeekday  更新周(1-7)
 * @returns
 */
export function isCurrentWeekdayUpdateTimePassed(updateTimeHHmm: string, updateWeekday: number) {
    const now = dayjs()
    const currentWeekday = now.isoWeekday()
    if (currentWeekday !== updateWeekday) {
        return currentWeekday > updateWeekday
    }

    // 解析输入的时间字符串
    const [hours, minutes] = updateTimeHHmm.split(':').map(Number)

    const [currentHours, currentMinutes] = now.format('HH:mm').split(':').map(Number)
    if (hours !== currentHours) {
        return currentHours > hours
    }
    if (minutes !== currentMinutes) {
        return currentHours > minutes
    }
    return true
}

export function getUpdateWeekdayDate(updateWeekday: number) {
    return dayjs().isoWeekday(updateWeekday)
}

export function getFirstEpisodeDateTime(updateTimeHHmm: string, updateWeekday: number, currentEpisode: number) {
    /** 本周应该更新的集数 */
    let currentWeekendEpisode = currentEpisode
    // 如果本周还每更新，则本周更新的集数应该+1
    if (!isCurrentWeekdayUpdateTimePassed(updateTimeHHmm, updateWeekday)) {
        currentWeekendEpisode++
    }

    // 解析输入的时间字符串
    const [hours, minutes] = updateTimeHHmm.split(':').map(Number)
    const updateWeekdayDate = getUpdateWeekdayDate(updateWeekday).hour(hours).minute(minutes)
    // 计算第一集的日期时间
    const firstEpisodeDateTime = updateWeekdayDate.subtract((currentWeekendEpisode - 1) * 7, 'day')

    return firstEpisodeDateTime
}

export function getlastEpisodeDateTime(
    updateTimeHHmm: string,
    updateWeekday: number,
    currentEpisode: number,
    totalEpisode: number
) {
    const firstEpisodeDateTime = getFirstEpisodeDateTime(updateTimeHHmm, updateWeekday, currentEpisode)
    const lastEpisodeDateTime = firstEpisodeDateTime.add((totalEpisode - 1) * 7, 'day')

    return lastEpisodeDateTime
}
