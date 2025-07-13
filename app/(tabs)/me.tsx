import { cn } from '@/utils/tailwind'
import React from 'react'
import { StyleSheet, Text, View } from 'react-native'
import { SafeAreaView } from 'react-native-safe-area-context'

export default function InputText() {
    return (
        <SafeAreaView style={styles.container}>
            {/* <View style={styles.box}>
                <View style={[styles.button, styles.export]}>
                    <IconSymbol size={20} name="arrow.down.and.line.horizontal.and.arrow.up" color={'#fff'} />
                    <Text style={{ color: '#fff', fontSize: 18 }} numberOfLines={1}>
                        导出数据为JSON文件件
                    </Text>
                </View>
                <Text>导入JSON文件</Text>
                <View style={[styles.button, styles.upload]}>
                    <IconSymbol size={20} name="arrow.up.doc.on.clipboard" color={'#18181b'} />
                    <Text style={{ color: '#18181b', fontSize: 18 }} numberOfLines={1}>
                        导出数据为JSON文件件
                    </Text>
                </View>
            </View>
            <CustomDatePicker3 /> */}
            <View className="items-center justify-center">
                <View className={cn('h-40 w-56 items-center justify-center rounded-md bg-pink-400')}>
                    <Text className="text-2xl text-white">tailwindcss</Text>
                </View>
            </View>
        </SafeAreaView>
    )
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#f9fafb',
        padding: 20,
    },
    box: {
        padding: 20,
        backgroundColor: '#fff',
        borderRadius: 5,
    },
    button: {
        justifyContent: 'center',
        alignItems: 'center',
        flexDirection: 'row',
        borderRadius: 5,
        height: 50,
    },
    export: {
        backgroundColor: '#18181b',
    },
    upload: {
        backgroundColor: '#fff',
        borderWidth: 1,
        borderColor: '#e5e7eb',
    },
})
