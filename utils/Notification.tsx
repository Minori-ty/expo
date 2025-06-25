import React from 'react'
import { Button, Text, View } from 'react-native'
import { sendNotification } from './notifications'

const Notification = () => {
    return (
        <View>
            <Text>Notification</Text>
            <Button
                title="发送通知"
                onPress={() => {
                    sendNotification('测试通知', '这是一个测试通知内容')
                }}
            />
        </View>
    )
}

export default Notification
