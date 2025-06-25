// backgroundTask.js
import * as BackgroundTask from 'expo-background-task'

// 定义任务名称
export const BACKGROUND_TASK_NAME = 'LOG_TASK'

// 注册后台任务
export function registerBackgroundFetchAsync() {
    // 定义任务处理器

    // 注册任务（iOS/Android 通用 API）
    BackgroundTask.registerTaskAsync(BACKGROUND_TASK_NAME, {
        minimumInterval: 1 * 60, // 1分钟（单位：秒）
    })
}

// 取消注册任务（可选）
export async function unregisterBackgroundFetchAsync() {
    return BackgroundTask.unregisterTaskAsync(BACKGROUND_TASK_NAME)
}
