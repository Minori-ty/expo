import * as BackgroundTask from 'expo-background-task'
import * as Location from 'expo-location'
import * as Notifications from 'expo-notifications'
import * as TaskManager from 'expo-task-manager'
import { Platform } from 'react-native'
import { sendNotification } from './notifications'

// 定义后台任务
const BACKGROUND_FETCH_TASK = 'background-fetch-task'
const LOCATION_TASK = 'location-task'
// 定义后台任务名称
const BACKGROUND_TASK_NAME = 'NOTIFICATION_TASK'

// 注册后台获取任务
TaskManager.defineTask(BACKGROUND_FETCH_TASK, async () => {
    try {
        console.log('执行后台任务')

        if (Platform.OS === 'android') {
            await sendNotification('后台任务提醒', '应用正在后台运行并执行任务')
        }

        // 旧版返回值直接用字符串
        return 'success'
    } catch (error) {
        console.error('后台任务执行失败:', error)
        return 'failure'
    }
})

// 注册位置后台任务（可选）
TaskManager.defineTask(LOCATION_TASK, async ({ data, error }: { data?: any; error?: any }) => {
    if (error) {
        console.error('位置任务错误:', error)
        return
    }
    if (data && data.locations) {
        const { locations } = data
        console.log('位置更新:', locations)
        // 处理位置数据
    }
})

// 初始化后台任务
export async function initializeBackgroundTasks() {
    await checkPermissions()

    // 旧版 API 使用 BackgroundTask.isTaskRegisteredAsync
    const isTaskRegistered = BackgroundTask.BackgroundTaskResult.Success
    if (!isTaskRegistered) {
        console.log('后台任务未注册，注册任务...')
        await BackgroundTask.registerTaskAsync(BACKGROUND_FETCH_TASK, {
            // 旧版使用 taskType 而非 isPeriodic
            minimumInterval: 15 * 60,
        })
    }

    if (Platform.OS === 'ios') {
        console.log('iOS: 应用需要用户至少启动一次才能接收后台任务')
    }
}

// 检查并请求必要的权限
async function checkPermissions() {
    // 通知权限
    const { status: notificationStatus } = await Notifications.getPermissionsAsync()
    if (notificationStatus !== 'granted') {
        await Notifications.requestPermissionsAsync()
    }

    // 后台位置权限（如果需要）
    if (Platform.OS === 'ios') {
        const { status: foregroundStatus } = await Location.requestForegroundPermissionsAsync()
        if (foregroundStatus !== 'granted') {
            console.log('前台位置权限未授予')
            return
        }

        const { status: backgroundStatus } = await Location.requestBackgroundPermissionsAsync()
        if (backgroundStatus !== 'granted') {
            console.log('后台位置权限未授予')
        }
    }
}

const TASK_NAME = 'BACKGROUND_PUSH_TASK'

export function runTask() {
    const result = TaskManager.isTaskDefined(TASK_NAME)
    if (!result) {
        TaskManager.defineTask(TASK_NAME, async () => {
            try {
                await sendNotification('番剧更新提醒', '有新番剧更新了！')
                return BackgroundTask.BackgroundTaskResult.Success
            } catch (e) {
                return BackgroundTask.BackgroundTaskResult.Failed
            }
        })
    }
}

export async function registerBackgroundTask() {
    await BackgroundTask.registerTaskAsync(TASK_NAME, {
        minimumInterval: 60, // 最小60秒，系统实际可能更长
    })
}
