import Notifications from 'expo-notifications'
import { Platform } from 'react-native'

export async function requestNotificationPermission() {
    let permission
    if (Platform.OS === 'ios') {
        // iOS 需要显式请求权限
        permission = await Notifications.requestPermissionsAsync()
    } else {
        // Android 13 及以上需要请求通知权限
        permission = await Notifications.getPermissionsAsync()
        if (!permission.granted) {
            permission = await Notifications.requestPermissionsAsync()
        }
    }

    if (permission.granted) {
        console.log('通知权限已授权')
    } else {
        console.log('通知权限未授权')
    }
}

export function sendNotification(title: string, body: string) {
    Notifications.scheduleNotificationAsync({
        content: {
            title,
            body,
        },
        trigger: null,
    })
}
