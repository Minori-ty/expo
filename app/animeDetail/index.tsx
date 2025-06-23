import { useNavigation } from 'expo-router'
import React, { useEffect } from 'react'
import { Text, View } from 'react-native'

const index = () => {
    const navigation = useNavigation()
    useEffect(() => {
        navigation.setOptions({
            headerTitle: '动漫详情',
            headerTitleAlign: 'center',
        })
    }, [navigation])
    return (
        <View>
            <Text>index</Text>
        </View>
    )
}

export default index
