import { db } from '@/db'
import { insertSchduleSchema, schduleTable } from '@/db/schema'
import { eq } from 'drizzle-orm'

function useInsertSchedule(animeId: number, isNotification: boolean) {
    return new Promise(async (resolve, reject) => {
        const result = insertSchduleSchema.safeParse({
            animeId,
            isNotification,
        })
        if (result.success) {
            const data = await db.insert(schduleTable).values(result.data).returning({ id: schduleTable.id })
            console.log(data[0].id)
            resolve(data[0].id)
        } else {
            reject(result.error)
        }
    })
}

async function useDeleteSchedule(id: number) {
    return await db.delete(schduleTable).where(eq(schduleTable.id, id))
}

async function useSelectSchedule() {
    return await db.select().from(schduleTable)
}
