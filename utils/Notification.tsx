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
    await sendNotification('凡人修仙传', '第130集更新了')
}
