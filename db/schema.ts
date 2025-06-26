import { sql } from 'drizzle-orm'
import { integer, SQLiteColumnBuilderBase, sqliteTable, text } from 'drizzle-orm/sqlite-core'
import { createInsertSchema, createSelectSchema } from 'drizzle-zod'

const table = {
    id: integer('id').primaryKey({ autoIncrement: true }),
    name: text('name').notNull(),
    updateWeekday: integer('update_weekday').notNull(),
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
    updateWeekday: (schema) => schema.int().min(1).max(7),
    updateTimeHHmm: (schema) => schema.regex(/^([01]\d|2[0-3]):([0-5]\d)$/),
    // isOver: (schema) =>
    //     schema.int().refine((val) => val === 0 || val === 1, {
    //         error: 'isOver must be 0 or 1',
    //     }),
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
    updateTimeHHmm: (schema) => schema.regex(/^([01]\d|2[0-3]):([0-5]\d)$/),
    // isOver: (schema) =>
    //     schema.int().refine((val) => val === 0 || val === 1, {
    //         error: 'isOver must be 0 or 1',
    //     }),
    isOver: (shema) => shema,
    createdAt: (schema) => schema.int().gte(0),
})

export const selectSchduleSchema = createSelectSchema(schduleTable)
