import * as Notifications from 'expo-notifications'
import { Platform } from 'react-native'

export async function requestNotificationPermission() {
    let permission
    if (Platform.OS === 'ios') {
        // iOS 需要显式请求权限
        permission = await Notifications.requestPermissionsAsync({
            ios: {
                allowAlert: true,
                allowBadge: true,
                allowSound: true,
            },
        })
    } else {
        // Android 13 及以上需要请求通知权限
        permission = await Notifications.getPermissionsAsync()
        if (!permission.granted) {
            permission = await Notifications.requestPermissionsAsync()
        }
        await Notifications.setNotificationChannelAsync('番剧推送', {
            name: '番剧推送',
            importance: Notifications.AndroidImportance.MAX, // MAX 会以悬浮横幅显示
        })
    }

    if (permission.granted) {
        console.log('通知权限已授权')
    } else {
        console.log('通知权限未授权')
    }
}

export function sendNotification(title: string, body: string) {
    return new Promise((resolve, reject) => {
        try {
            Notifications.scheduleNotificationAsync({
                content: {
                    title,
                    body,
                    priority: Notifications.AndroidNotificationPriority.HIGH, // 高优先级
                },
                trigger: {
                    channelId: '番剧推送',
                },
            })
            resolve('通知已发送')
        } catch {
            reject('发送通知失败')
        }
    })
}
