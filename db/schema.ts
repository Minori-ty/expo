import { sql } from 'drizzle-orm'
import { integer, sqliteTable, text } from 'drizzle-orm/sqlite-core'
import { createInsertSchema, createSelectSchema } from 'drizzle-zod'

export const enum EUpdateWeekday {
    /** 周一 */
    MONDAY = 1,
    /** 周二 */
    TUESDAY = 2,
    /** 周三 */
    WEDNESDAY = 3,
    /** 周四 */
    THURSDAY = 4,
    /** 周五 */
    FRIDAY = 5,
    /** 周六 */
    SATURDAY = 6,
    /** 周日 */
    SUNDAY = 7,
}

export const enum EStatus {
    /** 已完结 */
    COMPLETED = 1,
    /** 连载中 */
    ONGOING = 2,
    /** 即将更新 */
    COMING_SOON = 3,
}

/** 动漫列表数据表 */
export const animeTable = sqliteTable('anime', {
    id: integer('id').primaryKey({ autoIncrement: true }).notNull(),
    name: text('name').notNull(),
    updateWeekday: integer('update_weekday').$type<EUpdateWeekday>().notNull(),
    updateTimeHHmm: text('update_time_hhmm').notNull(),
    currentEpisode: integer('current_episode').notNull(),
    totalEpisode: integer('total_episode').notNull(),
    status: integer('status').$type<EStatus>().notNull(),
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
    updateWeekday: (schema) => schema.int().min(1).max(7),
    updateTimeHHmm: (schema) => schema.regex(/(0[0-9]|1[0-9]|2[0-3]):[0-5][0-9]/),
    status: (schema) => schema.int().min(1).max(3),
    createdAt: (schema) => schema.int().gte(0),
    firstEpisodeDateTime: (schema) => schema.int().gte(0),
    lastEpisodeDateTime: (schema) => schema.int().gte(0),
})

export const selectAnimeSchema = createSelectSchema(animeTable)

/** 动漫更新表数据表 */
export const schduleTable = sqliteTable('schdule', {
    id: integer('id').primaryKey({ autoIncrement: true }).notNull(),
    animeId: integer('anime_id')
        .notNull()
        .references(() => animeTable.id, { onDelete: 'cascade' }),
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

/** 动漫即将更新表数据表 */
export const upcomingTable = sqliteTable('upcoming', {
    id: integer('id').primaryKey({ autoIncrement: true }).notNull(),
    animeId: integer('anime_id')
        .notNull()
        .references(() => animeTable.id, { onDelete: 'cascade' }),
})

export const calendarTable = sqliteTable('calendar', {
    id: integer('id').primaryKey({ autoIncrement: true }).notNull(),
    scheduleId: integer('schdule_id')
        .notNull()
        .references(() => schduleTable.id, { onDelete: 'cascade' }),
    animeId: integer('anime_id')
        .notNull()
        .references(() => animeTable.id),
    calendarId: text('calendar_id').notNull(),
})
