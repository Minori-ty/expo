import { DarkTheme, DefaultTheme, ThemeProvider } from '@react-navigation/native'
import { Stack } from 'expo-router'
import { StatusBar } from 'expo-status-bar'
import { lazy, Suspense, useEffect, useState } from 'react'
import 'react-native-reanimated'

import { db } from '@/db'
import migrations from '@/drizzle/migrations'
import { useColorScheme } from '@/hooks/useColorScheme'
import { getNotificationPermission } from '@/permissions'
import { queryClient } from '@/utils/react-query'
import { QueryClientProvider } from '@tanstack/react-query'
import { useMigrations } from 'drizzle-orm/expo-sqlite/migrator'
import * as Notifications from 'expo-notifications'
import * as SplashScreen from 'expo-splash-screen'
import { StyleSheet, Text, View } from 'react-native'

// 配置通知处理
Notifications.setNotificationHandler({
    handleNotification: async () => ({
        shouldPlaySound: true,
        shouldSetBadge: true,
        shouldShowBanner: true,
        shouldShowList: true,
    }),
})

// 创建一个资源加载器
const loadResources = async () => {
    // 等待字体加载
    const fontPromise = import('expo-font').then(({ useFonts }) => {
        const [loaded] = useFonts({
            SpaceMono: require('../assets/fonts/SpaceMono-Regular.ttf'),
        })
        return loaded
    })

    // 等待数据库迁移
    const migrationPromise = new Promise((resolve, reject) => {
        const { success, error } = useMigrations(db, migrations)
        if (error) {
            reject(error)
        } else if (success) {
            resolve(true)
        } else {
            // 等待迁移完成
            const interval = setInterval(() => {
                const { success, error } = useMigrations(db, migrations)
                if (error) {
                    clearInterval(interval)
                    reject(error)
                } else if (success) {
                    clearInterval(interval)
                    resolve(true)
                }
            }, 100)
        }
    })

    // 等待通知权限
    const permissionPromise = getNotificationPermission()

    // 隐藏启动屏
    const splashScreenPromise = SplashScreen.hideAsync()

    // 并行等待所有资源
    return Promise.all([fontPromise, migrationPromise, permissionPromise, splashScreenPromise])
}

// 创建一个异步组件
const LazyRootLayout = lazy(async () => {
    const colorScheme = useColorScheme()
    return loadResources().then(() => ({
        default: () => {
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
        },
    }))
})

export default function RootLayout() {
    const [error, setError] = useState(null)

    useEffect(() => {
        // 处理资源加载错误
        loadResources().catch((err) => {
            setError(err)
        })
    }, [])

    if (error) {
        return (
            <View style={styles.center}>
                <Text style={styles.error}>加载错误</Text>
            </View>
        )
    }

    return (
        <Suspense
            fallback={
                <View style={styles.center}>
                    <Text>正在加载应用...</Text>
                </View>
            }
        >
            <LazyRootLayout />
        </Suspense>
    )
}

const styles = StyleSheet.create({
    center: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
    },
    error: { color: 'red' },
})
