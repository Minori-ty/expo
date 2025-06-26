import { initializeBackgroundTask } from '@/utils/background'
import { useNavigation } from 'expo-router'
import React, { useEffect } from 'react'
import { Text, View } from 'react-native'

let resolver: (() => void) | null

const promise = new Promise<void>((resolve) => {
    resolver = resolve
})

initializeBackgroundTask()

const index = () => {
    const navigation = useNavigation()
    useEffect(() => {
        navigation.setOptions({
            headerTitle: '动漫详情',
            headerTitleAlign: 'center',
        })
    }, [navigation])

    useEffect(() => {
        if (resolver) {
            resolver()
        }
    }, [])
    return (
        <View>
            <Text>index</Text>
        </View>
    )
}

export default index
