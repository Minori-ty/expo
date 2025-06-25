import LottieView from 'lottie-react-native'
import React from 'react'
import { StyleSheet, View } from 'react-native'

export default function Empty() {
    return (
        <View style={styles.container}>
            <LottieView source={require('./assets/lotties/empty.json')} autoPlay loop style={styles.lottie} />
        </View>
    )
}

const styles = StyleSheet.create({
    container: {
        flex: 1, // 占满整个屏幕
        justifyContent: 'center', // 垂直居中
        alignItems: 'center', // 水平居中
        backgroundColor: '#fff', // 可选：设置背景色
    },
    lottie: {
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        width: '100%',
        height: '100%',
    },
})
