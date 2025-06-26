import * as BackgroundTask from 'expo-background-task'
import * as TaskManager from 'expo-task-manager'
import { useEffect, useState } from 'react'
import { StyleSheet, Text, View } from 'react-native'
import { BACKGROUND_TASK_NAME, registerBackgroundTask } from './background'
import { sendNotification } from './notifications'

TaskManager.defineTask(BACKGROUND_TASK_NAME, async () => {
    try {
        console.log('运行定时任务')

        await sendNotification('番剧更新提醒', '有新的番剧更新啦！')
        return BackgroundTask.BackgroundTaskResult.Success
    } catch (error) {
        console.error('后台任务执行失败:', error)
        return BackgroundTask.BackgroundTaskResult.Failed
    }
})

function App() {
    const [isRegistered, setIsRegistered] = useState(false)
    useEffect(() => {
        registerBackgroundTask()
        init()
        BackgroundTask.triggerTaskWorkerForTestingAsync()
        // 应用启动时注册后台任务
    }, [])

    async function init() {
        const isDefined = await TaskManager.isTaskRegisteredAsync(BACKGROUND_TASK_NAME)
        setIsRegistered(isDefined)
    }

    return (
        <View style={styles.container}>
            {isRegistered ? <Text>注册{isRegistered.toString()}</Text> : <Text>后台任务未注册!</Text>}
        </View>
    )
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#fff',
        alignItems: 'center',
        justifyContent: 'center',
    },
})

export default App
