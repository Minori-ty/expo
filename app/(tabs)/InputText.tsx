import React, { useEffect, useState } from 'react'
import { Dimensions, Keyboard, ScrollView, StyleSheet, Text, TextInput, View } from 'react-native'

export default function InputText() {
    const [keyboardHeight, setKeyboardHeight] = useState(0)
    // 组建加载完毕时监听事件
    useEffect(() => {
        Keyboard.addListener('keyboardDidShow', (e) => {
            setKeyboardHeight(e.endCoordinates.height)
        })
        Keyboard.addListener('keyboardDidHide', (e) => {
            setKeyboardHeight(0)
        })
        return () => {
            //  组建卸载时，移除事件监听
            Keyboard.removeAllListeners('keyboardDidShow')
            Keyboard.removeAllListeners('keyboardDidHide')
        }
    }, [])

    const screenWidth = Dimensions.get('window').width
    const screenHeight = Dimensions.get('window').height

    return (
        <ScrollView style={{ width: screenWidth, height: screenHeight - keyboardHeight }}>
            <Text>InputText</Text>
            <View style={{ height: 500 }}></View>
            <TextInput style={[styles.input]} placeholder="请输入当前更新集数" keyboardType="numeric" />
            <TextInput style={[styles.input]} placeholder="请输入当前更新集数" keyboardType="numeric" />
            <View style={{ height: 500 }}></View>
            <TextInput style={[styles.input]} placeholder="请输入当前更新集数" keyboardType="numeric" />
        </ScrollView>
    )
}

const styles = StyleSheet.create({
    input: {
        borderWidth: 1,
        borderColor: '#ccc',
        borderRadius: 4,
        padding: 0,
        paddingLeft: 10,
        alignItems: 'center',
        fontSize: 16,
        height: 40, // 固定高度
        lineHeight: 40,
        textAlignVertical: 'center',
        justifyContent: 'center',
    },
})
