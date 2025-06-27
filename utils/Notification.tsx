import { animeTable } from '@/db/schema'
import { useInsertAnime, useSelectAnime } from '@/hooks/useDrizzle'
import { getCalendarPermission } from '@/permissions'
import { sendNotifications } from '@/permissions/notifications'
import { useMutation, useQuery } from '@tanstack/react-query'
import * as Calendar from 'expo-calendar'
import { Image } from 'expo-image'
import React, { useEffect } from 'react'
import { Button, ScrollView, StyleSheet, Text, View } from 'react-native'
import { queryClient } from './react-query'

type TData = typeof animeTable.$inferInsert
const blurhash =
    '|rF?hV%2WCj[ayj[a|j[az_NaeWBj@ayfRayfQfQM{M|azj[azf6fQfQfQIpWXofj[ayj[j[fQayWCoeoeaya}j[ayfQa{oLj?j[WVj[ayayj[fQoff7azayj[ayj[j[ayofayayayj[fQj[ayayj[ayfjj[j[ayjuayj['

async function addEventWithReminder() {
    const hasPermission = await getCalendarPermission()
    if (!hasPermission) {
        console.log('没有日历权限')
        sendNotifications('没有日历权限', '没有日历权限')
        return
    }

    // 获得默认日历ID
    const calendars = await Calendar.getCalendarsAsync()
    const defaultCalendar = calendars.find((cal) => cal.allowsModifications)

    if (!defaultCalendar) {
        console.log('没有找到可修改的默认日历')
        return
    }

    const eventId = await Calendar.createEventAsync(defaultCalendar.id, {
        title: '测试事件',
        startDate: new Date(Date.now() + 2 * 60 * 1000),
        endDate: new Date(Date.now() + 26 * 60 * 1000),
        timeZone: 'Asia/Shanghai',
        alarms: [
            { relativeOffset: 0 }, // 提前10分钟通知
        ],
    })
    console.log('事件已添加，ID:', eventId)
    return eventId
}

const Notification: React.FC = () => {
    type TAnime = typeof animeTable.$inferSelect
    // const [list, setList] = useState<Awaited<ReturnType<typeof useSelectAnime>>>([])
    async function insert() {
        const data = {
            name: 'a',
            updateWeekday: 1,
            updateTimeHHmm: '12:00',
            currentEpisode: 0,
            totalEpisode: 1,
            isOver: false,
            cover: 'https://sfaf',
        }
        return await useInsertAnime(data)
    }

    async function search() {
        const data = await useSelectAnime()
        // setList(data)
        return data
    }
    const { mutate: inserItem } = useMutation({
        mutationFn: insert,
        onSuccess: () => {
            queryClient.invalidateQueries({
                queryKey: ['search'],
            })
            queryClient.invalidateQueries({
                queryKey: ['schdule'],
            })
        },
    })

    const { data: list = [] } = useQuery({
        queryKey: ['search'],
        queryFn: search,
    })

    useEffect(() => {
        getCalendarPermission()
    }, [])
    return (
        <ScrollView>
            <Text>Notification</Text>
            <Button
                title="发送通知"
                onPress={() => {
                    sendNotifications('测试通知', '这是一个测试通知内容')
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
            <Button title="添加数据" onPress={() => inserItem()} />
            <Button title="添加日历提醒" onPress={addEventWithReminder} />
            {list.map((item) => {
                return <Text key={item.id}>{JSON.stringify(item)}</Text>
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
