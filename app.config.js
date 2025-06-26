import pkg from './package.json' assert { type: 'json' }
/**
 * @type {import('expo/config').ExpoConfig}
 */
const config = {
    expo: {
        name: pkg.name,
        slug: 'app',
        version: pkg.version,
        orientation: 'portrait',
        icon: './assets/images/icon.png',
        scheme: 'app',
        userInterfaceStyle: 'automatic',
        newArchEnabled: true,
        ios: {
            supportsTablet: true,
        },
        android: {
            adaptiveIcon: {
                foregroundImage: './assets/images/adaptive-icon.png',
                backgroundColor: '#ffffff',
            },
            edgeToEdgeEnabled: true,
            package: 'com.minority.app',
            permissions: [
                'ACCESS_NETWORK_STATE',
                'FOREGROUND_SERVICE',
                'RECEIVE_BOOT_COMPLETED',
                'WAKE_LOCK',
                'SCHEDULE_EXACT_ALARM', // 可选，用于高频任务
                'ACCESS_COARSE_LOCATION',
                'ACCESS_FINE_LOCATION',
                'ACCESS_BACKGROUND_LOCATION',
                'FOREGROUND_SERVICE_LOCATION',
                'IGNORE_BATTERY_OPTIMIZATION',
            ],
        },
        web: {
            bundler: 'metro',
            output: 'static',
            favicon: './assets/images/favicon.png',
        },
        plugins: [
            'expo-router',
            'expo-background-task',
            [
                'expo-sqlite',
                {
                    enableFTS: true,
                    useSQLCipher: true,
                    android: {
                        // Override the shared configuration for Android
                        enableFTS: false,
                        useSQLCipher: false,
                    },
                    ios: {
                        // You can also override the shared configurations for iOS
                        customBuildFlags: ['-DSQLITE_ENABLE_DBSTAT_VTAB=1 -DSQLITE_ENABLE_SNAPSHOT=1'],
                    },
                },
            ],
            [
                'expo-notifications',
                {
                    color: '#ffffff',
                    defaultChannel: '番剧推送',
                    enableBackgroundRemoteNotifications: false,
                    backgroundFetchEnabled: true,
                },
            ],
            [
                'expo-splash-screen',
                {
                    image: './assets/images/splash-icon.png',
                    imageWidth: 200,
                    resizeMode: 'contain',
                    backgroundColor: '#ffffff',
                },
            ],
            [
                'expo-build-properties',
                {
                    android: {
                        compileSdkVersion: 35,
                        targetSdkVersion: 35,
                        buildToolsVersion: '35.0.0',
                    },
                    ios: {
                        deploymentTarget: '15.1',
                    },
                },
            ],
        ],
        experiments: {
            typedRoutes: true,
        },
        extra: {
            router: {},
            eas: {
                projectId: '5df2f02e-5af9-4191-8ad2-bbf3c5e8d468',
            },
        },
        backgroundTasks: [
            {
                taskName: 'background-task',
                allowsNetworking: true,
                minInterval: 60, // 1分钟（单位：秒）
                android: {
                    permission: ['RECEIVE_BOOT_COMPLETED'],
                },
            },
        ],
    },
}

export default config
