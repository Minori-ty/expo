import { useLocalSearchParams, useNavigation } from 'expo-router'
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
    const { id } = useLocalSearchParams()
    return (
        <View>
            <Text>动漫id-{id}</Text>
        </View>
    )
}

export default index
