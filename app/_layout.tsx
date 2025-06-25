import { DarkTheme, DefaultTheme, ThemeProvider } from '@react-navigation/native'
import { useFonts } from 'expo-font'
import { Stack } from 'expo-router'
import { StatusBar } from 'expo-status-bar'
import 'react-native-reanimated'

import { useColorScheme } from '@/hooks/useColorScheme'
import { registerBackgroundTask, runTask } from '@/utils/background'
import { requestNotificationPermission } from '@/utils/notifications'
import { useEffect } from 'react'

export default function RootLayout() {
    const colorScheme = useColorScheme()
    const [loaded] = useFonts({
        SpaceMono: require('../assets/fonts/SpaceMono-Regular.ttf'),
    })

    useEffect(() => {
        // 只会在组件挂载时调用一次
        async function askPermission() {
            await requestNotificationPermission()
            try {
                await registerBackgroundTask()
                runTask()
            } catch {
                console.error('注册后台任务失败')
            }
        }
        askPermission()
    }, [])

    if (!loaded) {
        // Async font loading only occurs in development.
        return null
    }

    return (
        <ThemeProvider value={colorScheme === 'dark' ? DarkTheme : DefaultTheme}>
            <Stack>
                <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
                <Stack.Screen name="+not-found" />
            </Stack>
            <StatusBar style="auto" />
        </ThemeProvider>
    )
}
