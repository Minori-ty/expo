import { DarkTheme, DefaultTheme, ThemeProvider } from '@react-navigation/native'
import { useFonts } from 'expo-font'
import { Stack } from 'expo-router'
import { StatusBar } from 'expo-status-bar'
import 'react-native-reanimated'

import { useColorScheme } from '@/hooks/useColorScheme'
import { DrizzleContextProvider, migrateAsync } from '@/hooks/useDrizzle'
import { requestNotificationPermission } from '@/utils/notifications'
import * as Notifications from 'expo-notifications'
import { SQLiteProvider } from 'expo-sqlite'
import { Suspense, useEffect } from 'react'
import { ActivityIndicator } from 'react-native'

export const ANIME_DATABASE = 'anime'
export const SCHDULE_DATABASE = 'schdule'

Notifications.setNotificationHandler({
    handleNotification: async () => ({
        shouldPlaySound: true,
        shouldSetBadge: true,
        shouldShowBanner: true,
        shouldShowList: true,
    }),
})

export default function RootLayout() {
    const colorScheme = useColorScheme()
    const [loaded] = useFonts({
        SpaceMono: require('../assets/fonts/SpaceMono-Regular.ttf'),
    })

    useEffect(() => {
        // 只会在组件挂载时调用一次
        async function askPermission() {
            await requestNotificationPermission()
        }
        askPermission()
    }, [])

    if (!loaded) {
        // Async font loading only occurs in development.
        return null
    }

    return (
        <Suspense fallback={<ActivityIndicator size="large" />}>
            <SQLiteProvider
                databaseName={SCHDULE_DATABASE}
                options={{ enableChangeListener: true }}
                useSuspense
                onInit={migrateAsync}
            >
                <SQLiteProvider
                    databaseName={ANIME_DATABASE}
                    options={{ enableChangeListener: true }}
                    useSuspense
                    onInit={migrateAsync}
                >
                    <DrizzleContextProvider>
                        <ThemeProvider value={colorScheme === 'dark' ? DarkTheme : DefaultTheme}>
                            <Stack>
                                <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
                                <Stack.Screen name="+not-found" />
                            </Stack>
                            <StatusBar style="auto" />
                        </ThemeProvider>
                    </DrizzleContextProvider>
                </SQLiteProvider>
            </SQLiteProvider>
        </Suspense>
    )
}
