import React from 'react'
import { StyleSheet, View } from 'react-native'

interface IProgressBarProps {
    progress: number
}

function ProgressBar({ progress }: IProgressBarProps) {
    // 确保进度值在 0 到 1 之间
    const progressWidth = Math.min(Math.max(progress, 0), 1) * 100

    return (
        <View style={styles.container}>
            <View style={styles.progressBarContainer}>
                <View style={[styles.progressBar, { width: `${progressWidth}%` }]} />
            </View>
        </View>
    )
}

const styles = StyleSheet.create({
    container: {
        flexDirection: 'column',
        alignItems: 'center',
        marginVertical: 10,
    },
    progressBarContainer: {
        width: '100%', // 进度条容器的宽度为父容器的100%
        height: 10, // 进度条的高度
        backgroundColor: '#f0f0f0', // 背景色（进度条未完成部分）
        borderRadius: 5, // 圆角
    },
    progressBar: {
        height: '100%', // 进度条高度填充父容器
        backgroundColor: '#18181B', // 进度条颜色
        borderRadius: 5, // 圆角
    },
})

export default ProgressBar
