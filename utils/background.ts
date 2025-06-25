// backgroundTask.js
import * as BackgroundTask from 'expo-background-task'
import * as TaskManager from 'expo-task-manager'
import { sendNotification } from './notifications'

// 定义任务名称
export const BACKGROUND_TASK_NAME = 'LOG_TASK'

// 注册后台任务
export async function registerBackgroundFetchAsync() {
    // 定义任务处理器
    TaskManager.defineTask(BACKGROUND_TASK_NAME, async () => {
        try {
            await sendNotification('番剧更新提醒', '有新的番剧更新啦！')
            return BackgroundTask.BackgroundTaskResult.Success
        } catch (error) {
            console.error('后台任务执行失败:', error)
            return BackgroundTask.BackgroundTaskResult.Failed
        }
    })

    // 注册任务（iOS/Android 通用 API）
    return BackgroundTask.registerTaskAsync(BACKGROUND_TASK_NAME, {
        minimumInterval: 1 * 60, // 1分钟（单位：秒）
    })
}

// 取消注册任务（可选）
export async function unregisterBackgroundFetchAsync() {
    return BackgroundTask.unregisterTaskAsync(BACKGROUND_TASK_NAME)
}
