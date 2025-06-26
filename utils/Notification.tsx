import { db } from '@/db'
import { animeTable, insertAnimeSchema, selectAnimeSchema } from '@/db/schema'
import dayjs from 'dayjs'
import React, { useEffect, useState } from 'react'
import { Button, ScrollView, Text } from 'react-native'
import { sendNotification } from './notifications'

const Notification = () => {
    type TAnime = typeof animeTable.$inferInsert
    const [list, setList] = useState<TAnime[]>([])
    async function insert() {
        const data: TAnime = {
            name: 'a',
            updateWeekday: 1,
            updateTimeHHmm: '12:00',
            currentEpisode: 2,
            totalEpisode: 13,
            isOver: 0,
            cover: 'https://sfaf',
            createdAt: dayjs().unix(),
        }
        const result = insertAnimeSchema.safeParse(data)
        console.log(result)

        if (result.success) {
            await db.insert(animeTable).values(result.data)
            search()
        } else {
            console.log('插入数据验证失败:', result.error)
        }
    }

    async function search() {
        const row = await db.select().from(animeTable)

        const parseData = row.map((item) => selectAnimeSchema.parse(item))
        setList(parseData)
    }

    useEffect(() => {
        search()
    }, [])
    return (
        <ScrollView>
            <Text>Notification</Text>
            <Button
                title="发送通知"
                onPress={() => {
                    sendNotification('测试通知', '这是一个测试通知内容')
                }}
            />
            <Button title="添加数据" onPress={insert} />
            {list.map((item) => {
                return <Text key={item.id}>{item.createdAt && dayjs(item.createdAt * 1000).format('YYYY-MM-DD')}</Text>
            })}
        </ScrollView>
    )
}

export default Notification
