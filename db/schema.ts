import { sql } from 'drizzle-orm'
import { integer, sqliteTable, text } from 'drizzle-orm/sqlite-core'
import { createInsertSchema, createSelectSchema } from 'drizzle-zod'

type TUpdateWeekday = 1 | 2 | 3 | 4 | 5 | 6 | 7

function isTUpdateWeekday(value: number): value is TUpdateWeekday {
    return value >= 1 && value <= 7 && Number.isInteger(value)
}

/** 动漫列表数据表 */
export const animeTable = sqliteTable('anime', {
    id: integer('id').primaryKey({ autoIncrement: true }).notNull(),
    name: text('name').notNull(),
    updateWeekday: integer('update_weekday').$type<TUpdateWeekday>().notNull(),
    updateTimeHHmm: text('update_time_hhmm').notNull(),
    currentEpisode: integer('current_episode').notNull(),
    totalEpisode: integer('total_episode').notNull(),
    isFinished: integer('is_finished', { mode: 'boolean' })
        .notNull()
        .default(sql`0`),
    cover: text('cover').notNull(),
    createdAt: integer('created_at')
        .notNull()
        .default(sql`(unixepoch())`),
    firstEpisodeDateTime: integer('first_episode_date_time').notNull(),
    lastEpisodeDateTime: integer('last_episode_date_time').notNull(),
})

// 生成 Zod 验证模式
export const insertAnimeSchema = createInsertSchema(animeTable, {
    // 注意这里修改为函数形式
    updateWeekday: (schema) => schema.refine((val) => isTUpdateWeekday(val)),
    updateTimeHHmm: (schema) => schema.regex(/^([01]?[0-9]|2[0-3]):[0-5][0-9]$/),
    isFinished: (shema) => shema,
    createdAt: (schema) => schema.int().gte(1735689600),
    firstEpisodeDateTime: (schema) => schema.int().gte(1735689600),
    lastEpisodeDateTime: (schema) => schema.int().gte(1735689600),
})

export const selectAnimeSchema = createSelectSchema(animeTable)

/** 动漫更新表数据表 */
export const schduleTable = sqliteTable('schdule', {
    id: integer('id').primaryKey({ autoIncrement: true }).notNull(),
    animeId: integer('anime_id')
        .notNull()
        .references(() => animeTable.id),
    isNotification: integer('is_notification', { mode: 'boolean' })
        .notNull()
        .default(sql`0`),
})

// 生成 Zod 验证模式
export const insertSchduleSchema = createInsertSchema(schduleTable, {
    animeId: (schema) => schema.int().gte(0),
    isNotification: (shema) => shema,
})

export const selectSchduleSchema = createSelectSchema(schduleTable)
