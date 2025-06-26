import { db } from '@/db'
import { animeTable, insertAnimeSchema, selectAnimeSchema } from '@/db/schema'
import dayjs from 'dayjs'
import { Image } from 'expo-image'
import React, { useEffect, useState } from 'react'
import { Button, ScrollView, StyleSheet, Text, View } from 'react-native'
import { sendNotification } from './notifications'

const blurhash =
    '|rF?hV%2WCj[ayj[a|j[az_NaeWBj@ayfRayfQfQM{M|azj[azf6fQfQfQIpWXofj[ayj[j[fQayWCoeoeaya}j[ayfQa{oLj?j[WVj[ayayj[fQoff7azayj[ayj[j[ayofayayayj[fQj[ayayj[ayfjj[j[ayjuayj['

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
            <View style={styles.container}>
                <Image
                    style={styles.image}
                    source="https://picsum.photos/seed/696/3000/2000"
                    placeholder={{ blurhash }}
                    contentFit="cover"
                    transition={1000}
                    cachePolicy={'memory-disk'}
                />
            </View>
            <Button title="添加数据" onPress={insert} />
            {list.map((item) => {
                return <Text key={item.id}>{item.createdAt && dayjs(item.createdAt * 1000).format('YYYY-MM-DD')}</Text>
            })}
        </ScrollView>
    )
}

export default Notification

const styles = StyleSheet.create({
    container: {
        width: '100%',
        height: 300,
        backgroundColor: '#fff',
        alignItems: 'center',
        justifyContent: 'center',
    },
    image: {
        flex: 1,
        width: '100%',
        backgroundColor: '#0553',
    },
})
