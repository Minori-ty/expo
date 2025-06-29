import { useLocalSearchParams, useNavigation } from 'expo-router'
import React, { useEffect } from 'react'
import { Text, View } from 'react-native'

function EditAnime() {
    const navigation = useNavigation()
    useEffect(() => {
        navigation.setOptions({
            headerTitle: '编辑动漫信息',
            headerTitleAlign: 'center',
        })
    }, [navigation])
    const { id } = useLocalSearchParams()
    return (
        <View>
            <Text>{id}</Text>
        </View>
    )
}

export default EditAnime
