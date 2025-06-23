import pkg from './package.json'

export default {
    expo: {
        name: 'app',
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
        },
        web: {
            bundler: 'metro',
            output: 'static',
            favicon: './assets/images/favicon.png',
        },
        plugins: [
            'expo-router',
            [
                'expo-splash-screen',
                {
                    image: './assets/images/splash-icon.png',
                    imageWidth: 200,
                    resizeMode: 'contain',
                    backgroundColor: '#ffffff',
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
    },
}
