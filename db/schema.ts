import { sql } from 'drizzle-orm'
import { integer, type SQLiteColumnBuilderBase, sqliteTable, text } from 'drizzle-orm/sqlite-core'
import { createInsertSchema, createSelectSchema } from 'drizzle-zod'

type TUpdateWeekday = 1 | 2 | 3 | 4 | 5 | 6 | 7

function isTUpdateWeekday(value: number): value is TUpdateWeekday {
    return value >= 1 && value <= 7 && Number.isInteger(value)
}
const table = {
    id: integer('id').primaryKey({ autoIncrement: true }),
    name: text('name').notNull(),
    updateWeekday: integer('update_weekday').$type<TUpdateWeekday>().notNull(),
    updateTimeHHmm: text('update_time_hhmm').notNull(),
    currentEpisode: integer('current_episode').notNull(),
    totalEpisode: integer('total_episode').notNull(),
    isOver: integer('is_over', { mode: 'boolean' })
        .notNull()
        .default(sql`0`),
    cover: text('cover').notNull(),
    createdAt: integer('created_at')
        .notNull()
        .default(sql`(unixepoch())`),
} satisfies Record<string, SQLiteColumnBuilderBase>

/** 动漫列表数据表 */
export const animeTable = sqliteTable('anime', table)

// 生成 Zod 验证模式
export const insertAnimeSchema = createInsertSchema(animeTable, {
    // 注意这里修改为函数形式
    updateWeekday: (schema) => schema.refine((val) => isTUpdateWeekday(val)),
    updateTimeHHmm: (schema) => schema.regex(/^([01]?[0-9]|2[0-3]):[0-5][0-9]$/),
    isOver: (shema) => shema,
    createdAt: (schema) => schema.int().gte(0),
})

export const selectAnimeSchema = createSelectSchema(animeTable)

/** 动漫更新表数据表 */
export const schduleTable = sqliteTable('schdule', table)

// 生成 Zod 验证模式
export const insertSchduleSchema = createInsertSchema(schduleTable, {
    // 注意这里修改为函数形式
    updateWeekday: (schema) => schema.int().min(1).max(7),
    updateTimeHHmm: (schema) => schema.regex(/^([01]?[0-9]|2[0-3]):[0-5][0-9]$/),
    isOver: (shema) => shema,
    createdAt: (schema) => schema.int().gte(0),
})

export const selectSchduleSchema = createSelectSchema(schduleTable)
