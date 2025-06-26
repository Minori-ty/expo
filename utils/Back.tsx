import * as BackgroundTask from 'expo-background-task'
import * as TaskManager from 'expo-task-manager'
import { useEffect, useState } from 'react'
import { Button, StyleSheet, Text, View } from 'react-native'
import { sendNotification } from './notifications'

const BACKGROUND_TASK_IDENTIFIER = 'background-task'

// Register and create the task so that it is available also when the background task screen
// (a React component defined later in this example) is not visible.
// Note: This needs to be called in the global scope, not in a React component.
TaskManager.defineTask(BACKGROUND_TASK_IDENTIFIER, async () => {
    try {
        sendNotification('测试通知', '这是一个测试通知内容')
        console.log('开始定时任务')
    } catch (error) {
        console.error('Failed to execute the background task:', error)
        return BackgroundTask.BackgroundTaskResult.Failed
    }
    return BackgroundTask.BackgroundTaskResult.Success
})

// 2. Register the task at some point in your app by providing the same name
// Note: This does NOT need to be in the global scope and CAN be used in your React components!
async function registerBackgroundTaskAsync() {
    console.log('注册通知任务')
    return BackgroundTask.registerTaskAsync(BACKGROUND_TASK_IDENTIFIER, {
        minimumInterval: 60,
    })
}

// 3. (Optional) Unregister tasks by specifying the task name
// This will cancel any future background task calls that match the given name
// Note: This does NOT need to be in the global scope and CAN be used in your React components!
async function unregisterBackgroundTaskAsync() {
    return BackgroundTask.unregisterTaskAsync(BACKGROUND_TASK_IDENTIFIER)
}

export default function BackgroundTaskScreen() {
    const [isRegistered, setIsRegistered] = useState<boolean>(false)
    const [status, setStatus] = useState<BackgroundTask.BackgroundTaskStatus | null>(null)

    useEffect(() => {
        updateAsync()
    }, [])

    const updateAsync = async () => {
        const status = await BackgroundTask.getStatusAsync()
        setStatus(status)
        const isRegistered = await TaskManager.isTaskRegisteredAsync(BACKGROUND_TASK_IDENTIFIER)
        setIsRegistered(isRegistered)
    }

    const toggle = async () => {
        if (!isRegistered) {
            await registerBackgroundTaskAsync()
        } else {
            await unregisterBackgroundTaskAsync()
        }
        await updateAsync()
    }

    function startTask() {
        BackgroundTask.triggerTaskWorkerForTestingAsync()
    }

    return (
        <View style={styles.screen}>
            <View style={styles.textContainer}>
                <Text>
                    Background Task Service Availability:{' '}
                    <Text style={styles.boldText}>{status ? BackgroundTask.BackgroundTaskStatus[status] : null}</Text>
                </Text>
            </View>
            <Button
                disabled={status === BackgroundTask.BackgroundTaskStatus.Restricted}
                title={isRegistered ? '取消任务' : '开始任务'}
                onPress={toggle}
            />
            <Button title="查看任务状态" onPress={updateAsync} />
            <Button title="开始任务" onPress={startTask} />
        </View>
    )
}

const styles = StyleSheet.create({
    screen: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
    },
    textContainer: {
        margin: 10,
    },
    boldText: {
        fontWeight: 'bold',
    },
})
