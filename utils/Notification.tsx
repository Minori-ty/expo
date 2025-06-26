import { animeTable, insertAnimeSchema, selectAnimeSchema } from '@/db/schema'
import { useDrizzle } from '@/hooks/useDrizzle'
import dayjs from 'dayjs'
import React, { useEffect, useState } from 'react'
import { Button, Text, View } from 'react-native'
import { sendNotification } from './notifications'

const Notification = () => {
    type TAnimeList = typeof animeTable.$inferInsert
    const [list, setList] = useState<TAnimeList[]>([])
    const drizzleDb = useDrizzle()
    function insert() {
        const parse = insertAnimeSchema.parse({
            name: '1',
            updateWeekday: 1,
            updateTimeHHmm: '12:00',
            currentEpisode: 2,
            totalEpisode: 13,
            isOver: false,
            cover: 'https://sfaf',
            createdAt: dayjs().unix(),
        })
        drizzleDb.insert(animeTable).values(parse)
        search()
    }
    async function search() {
        const row = await drizzleDb.select().from(animeTable)
        const parseData = row.map((item) => selectAnimeSchema.parse(item))
        setList(parseData)
    }

    useEffect(() => {
        search()
    }, [])
    return (
        <View>
            <Text>Notification</Text>
            <Button
                title="发送通知"
                onPress={() => {
                    sendNotification('测试通知', '这是一个测试通知内容')
                }}
            />
            <Button title="添加数据" onPress={insert} />
            {list.map((item) => {
                return <Text>{JSON.stringify(item)}</Text>
            })}
        </View>
    )
}

export default Notification
