// backgroundTask.js
import * as BackgroundFetch from 'expo-background-fetch'
import * as BackgroundTask from 'expo-background-task'
import * as Notifications from 'expo-notifications'
import * as TaskManager from 'expo-task-manager'
import { sendNotification } from './notifications'

// 定义任务名称
export const BACKGROUND_TASK_NAME = 'LOG_TASK'

// 注册后台任务
export function registerBackgroundFetchAsync() {
    // 定义任务处理器

    // 注册任务（iOS/Android 通用 API）
    BackgroundTask.registerTaskAsync(BACKGROUND_TASK_NAME, {
        minimumInterval: 1 * 60, // 1分钟（单位：秒）
    })

    Notifications.registerTaskAsync(BACKGROUND_TASK_NAME)
}

export async function initializeBackgroundTask(appMountedPromise: Promise<void>) {
    TaskManager.defineTask(BACKGROUND_TASK_NAME, async () => {
        try {
            // await appMountedPromise // 等待应用挂载完成
            await sendNotification('番剧更新提醒', '有新的番剧更新啦！')
            return BackgroundTask.BackgroundTaskResult.Success
        } catch (error) {
            console.error('后台任务执行失败:', error)
            return BackgroundTask.BackgroundTaskResult.Failed
        }
    })

    if (!(await TaskManager.isTaskRegisteredAsync(BACKGROUND_TASK_NAME))) {
        // BackgroundTask.registerTaskAsync(BACKGROUND_TASK_NAME, {
        //     minimumInterval: 1 * 60, // 1分钟（单位：秒）
        // })
        BackgroundFetch.registerTaskAsync(BACKGROUND_TASK_NAME, {
            minimumInterval: 60,
            startOnBoot: true,
            stopOnTerminate: false,
        })
    }
}
