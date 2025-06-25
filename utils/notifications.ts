import Constants from 'expo-constants'
import * as Device from 'expo-device'
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
    Notifications.scheduleNotificationAsync({
        content: {
            title,
            body,
        },
        trigger: {
            channelId: '番剧推送',
        },
    })
}

async function registerForPushNotificationsAsync() {
    let token

    if (Platform.OS === 'android') {
        await Notifications.setNotificationChannelAsync('myNotificationChannel', {
            name: 'A channel is needed for the permissions prompt to appear',
            importance: Notifications.AndroidImportance.MAX,
            vibrationPattern: [0, 250, 250, 250],
            lightColor: '#FF231F7C',
        })
    }

    if (Device.isDevice) {
        const { status: existingStatus } = await Notifications.getPermissionsAsync()
        let finalStatus = existingStatus
        if (existingStatus !== 'granted') {
            const { status } = await Notifications.requestPermissionsAsync()
            finalStatus = status
        }
        if (finalStatus !== 'granted') {
            alert('Failed to get push token for push notification!')
            return
        }

        try {
            const projectId = Constants?.expoConfig?.extra?.eas?.projectId ?? Constants?.easConfig?.projectId
            if (!projectId) {
                throw new Error('Project ID not found')
            }
            token = (
                await Notifications.getExpoPushTokenAsync({
                    projectId,
                })
            ).data
            console.log(token)
        } catch (e) {
            token = `${e}`
        }
    } else {
        alert('Must use physical device for Push Notifications')
    }

    return token
}
