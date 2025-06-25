import Constants from 'expo-constants'
import * as Device from 'expo-device'
import * as Notifications from 'expo-notifications'
import { useEffect, useState } from 'react'
import { Button, Platform, Text, View } from 'react-native'
import { sendNotification } from './notifications'

Notifications.setNotificationHandler({
    handleNotification: async () => ({
        shouldPlaySound: true,
        shouldSetBadge: true,
        shouldShowBanner: true,
        shouldShowList: true,
        shouldShowAlert: true, // 允许系统弹出悬浮横幅
    }),
})

export default function App() {
    // const [expoPushToken, setExpoPushToken] = useState('')
    const [channels, setChannels] = useState<Notifications.NotificationChannel[]>([])
    const [notification, setNotification] = useState<Notifications.Notification | undefined>(undefined)

    useEffect(() => {
        // registerForPushNotificationsAsync().then((token) => token && setExpoPushToken(token))

        if (Platform.OS === 'android') {
            Notifications.getNotificationChannelsAsync().then((value) => setChannels(value ?? []))
        }
        const notificationListener = Notifications.addNotificationReceivedListener((notification) => {
            setNotification(notification)
        })

        const responseListener = Notifications.addNotificationResponseReceivedListener((response) => {
            console.log(response)
        })

        return () => {
            notificationListener.remove()
            responseListener.remove()
        }
    }, [])

    return (
        <View
            style={{
                flex: 1,
                alignItems: 'center',
                justifyContent: 'space-around',
            }}
        >
            <Text>{`Channels: ${JSON.stringify(
                channels.map((c) => c.id),
                null,
                2
            )}`}</Text>
            <View style={{ alignItems: 'center', justifyContent: 'center' }}>
                <Text>Title: {notification && notification.request.content.title} </Text>
                <Text>Body: {notification && notification.request.content.body}</Text>
                <Text>Data: {notification && JSON.stringify(notification.request.content.data)}</Text>
            </View>
            <Button
                title="Press to schedule a notification"
                onPress={async () => {
                    await schedulePushNotification()
                }}
            />
        </View>
    )
}

async function schedulePushNotification() {
    sendNotification('凡人修仙传', '第130集更新了')
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
        // Learn more about projectId:
        // https://docs.expo.dev/push-notifications/push-notifications-setup/#configure-projectid
        // EAS projectId is used here.
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
