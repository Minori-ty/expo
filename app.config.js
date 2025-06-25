import pkg from './package.json' assert { type: 'json' }

export default {
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
                'android.permission.SCHEDULE_EXACT_ALARM',
                'android.permission.ACCESS_COARSE_LOCATION',
                'android.permission.ACCESS_FINE_LOCATION',
                'android.permission.ACCESS_BACKGROUND_LOCATION',
                'android.permission.FOREGROUND_SERVICE',
                'android.permission.FOREGROUND_SERVICE_LOCATION',
                'android.permission.RECEIVE_BOOT_COMPLETED',
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
            'expo-sqlite',
            [
                'expo-notifications',
                {
                    color: '#ffffff',
                    defaultChannel: 'default',
                    enableBackgroundRemoteNotifications: false,
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
                taskName: 'LOG_TASK',
                allowsNetworking: true,
                minInterval: 60, // 1分钟（单位：秒）
                android: {
                    permission: ['android.permission.RECEIVE_BOOT_COMPLETED'],
                },
            },
        ],
    },
}
