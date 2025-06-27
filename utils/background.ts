// backgroundTask.js
import * as BackgroundTask from 'expo-background-task'
import * as TaskManager from 'expo-task-manager'

// 定义任务名称
export const BACKGROUND_TASK_NAME = 'LOG_TASK'

// 注册后台任务
export async function registerBackgroundTask() {
    // 定义任务处理器

    const status = await TaskManager.isTaskRegisteredAsync(BACKGROUND_TASK_NAME)
    if (status) return
    // 注册任务（iOS/Android 通用 API）
    BackgroundTask.registerTaskAsync(BACKGROUND_TASK_NAME, {
        minimumInterval: 15, // 最少15分钟触发（单位：分钟）
    })
}
