import * as Calendar from 'expo-calendar'

/** 获取日历权限 */
export async function getCalendarPermission() {
    const { status } = await Calendar.requestCalendarPermissionsAsync()
    if (status === Calendar.PermissionStatus.GRANTED) {
        return true
    }
    return false
}
