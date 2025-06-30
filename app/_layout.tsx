import { DarkTheme, DefaultTheme, ThemeProvider } from '@react-navigation/native'
import { useFonts } from 'expo-font'
import { Stack } from 'expo-router'
import { StatusBar } from 'expo-status-bar'
import 'react-native-reanimated'

import { db } from '@/db'
import migrations from '@/drizzle/migrations'
import { useColorScheme } from '@/hooks/useColorScheme'
import { getCalendarPermission, getNotificationPermission } from '@/permissions'
import { refreshScheduleAndCalendar, registerBackgroundTask, taskDefined } from '@/tasks'
import { queryClient } from '@/utils/react-query'
import { QueryClientProvider } from '@tanstack/react-query'
import { useMigrations } from 'drizzle-orm/expo-sqlite/migrator'
import * as Notifications from 'expo-notifications'
import * as SplashScreen from 'expo-splash-screen'
import { useEffect } from 'react'
import { Text } from 'react-native'

Notifications.setNotificationHandler({
    handleNotification: async () => ({
        shouldPlaySound: true,
        shouldSetBadge: true,
        shouldShowBanner: true,
        shouldShowList: true,
    }),
})

taskDefined()
export default function RootLayout() {
    const colorScheme = useColorScheme()
    const { success, error } = useMigrations(db, migrations)
    const [loaded] = useFonts({
        SpaceMono: require('../assets/fonts/SpaceMono-Regular.ttf'),
    })

    useEffect(() => {
        getNotificationPermission()
        getCalendarPermission()
        SplashScreen.hideAsync()
        registerBackgroundTask()
        refreshScheduleAndCalendar()
    }, [])

    if (!loaded) {
        // Async font loading only occurs in development.
        return null
    }

    if (error) {
        return <Text>Migration 错误: {error.message}</Text>
    }
    if (!success) {
        return <Text>正在 Migration...</Text>
    }

    return (
        <QueryClientProvider client={queryClient}>
            <ThemeProvider value={colorScheme === 'dark' ? DarkTheme : DefaultTheme}>
                <Stack>
                    <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
                    <Stack.Screen name="+not-found" />
                </Stack>
                <StatusBar style="auto" />
            </ThemeProvider>
        </QueryClientProvider>
    )
}
