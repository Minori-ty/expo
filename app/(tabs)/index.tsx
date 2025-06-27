import Empty from '@/components/lottie/Empty'
import { useSelectAnime } from '@/hooks/useAnime'
import Notification from '@/utils/Notification'
import { useQuery } from '@tanstack/react-query'
import dayjs from 'dayjs'
import { Image } from 'expo-image'
import React, { createContext, useContext, useState } from 'react'
import { Dimensions, StyleSheet, Text, View } from 'react-native'
import { SafeAreaView } from 'react-native-safe-area-context'
import { SceneMap, TabBar, TabView } from 'react-native-tab-view'

interface IScheduleContext {
    list: Awaited<ReturnType<typeof useSelectAnime>>
}

const scheduleContext = createContext<IScheduleContext | undefined>(undefined)

const useSchedule = () => {
    const ctx = useContext(scheduleContext)
    if (!ctx) throw new Error('scheduleContext must be used within ModalProvider')
    return ctx
}

function Schedule({ updateWeekday }: { updateWeekday: number }) {
    const { list } = useSchedule()
    const animeList = list.filter((item) => item.updateWeekday === updateWeekday)
    if (!animeList.length) {
        return <Empty />
    }
    const mapSchedule: Record<string, Awaited<ReturnType<typeof useSelectAnime>>> = {}
    animeList.forEach((item) => {
        if (mapSchedule[item.updateTimeHHmm]) {
            mapSchedule[item.updateTimeHHmm].push(item)
        } else {
            mapSchedule[item.updateTimeHHmm] = [item]
        }
    })
    const updateTimeHHmmList = Object.keys(mapSchedule)
    const sortedTimes = updateTimeHHmmList.sort((a, b) => {
        // 将时间字符串解析为 Day.js 对象，并提取时间戳
        const timeA = dayjs(`2000-01-01T${a}`).valueOf()
        const timeB = dayjs(`2000-01-01T${b}`).valueOf()

        // 比较时间戳
        return timeA - timeB
    })
    return (
        <View style={styles.schedule}>
            {sortedTimes.map((time, index) => {
                return <ScheduleItem time={time} animeList={mapSchedule[time]} key={index} />
            })}
        </View>
    )
}

interface IScheduleItemProps {
    time: string
    animeList: Awaited<ReturnType<typeof useSelectAnime>>
}
const blurhash =
    '|rF?hV%2WCj[ayj[a|j[az_NaeWBj@ayfRayfQfQM{M|azj[azf6fQfQfQIpWXofj[ayj[j[fQayWCoeoeaya}j[ayfQa{oLj?j[WVj[ayayj[fQoff7azayj[ayj[j[ayofayayayj[fQj[ayayj[ayfjj[j[ayjuayj['
function ScheduleItem({ time, animeList }: IScheduleItemProps) {
    return (
        <View style={styles.scheduleItem}>
            <View style={{ width: 50 }}>
                <Text>{time}</Text>
            </View>
            <View style={{ flex: 1 }}>
                {animeList.map((item) => {
                    return (
                        <View key={item.id} style={styles.animeCard}>
                            <Image
                                style={styles.image}
                                source="https://picsum.photos/seed/696/3000/2000"
                                placeholder={{ blurhash }}
                                contentFit="cover"
                                transition={1000}
                                cachePolicy={'memory-disk'}
                            />
                            <View>
                                <Text style={{ fontWeight: '900' }}>{item.name}</Text>
                                <Text>{item.currentEpisode}</Text>
                            </View>
                        </View>
                    )
                })}
            </View>
        </View>
    )
}

export default function MyTabs() {
    const [index, setIndex] = useState(0)
    const [routes] = useState([
        { key: 'monday', title: '周一' },
        { key: 'tuesday', title: '周二' },
        { key: 'wednesday', title: '周三' },
        { key: 'thursday', title: '周四' },
        { key: 'friday', title: '周五' },
        { key: 'saturday', title: '周六' },
        { key: 'sunday', title: '周日' },
    ])

    async function search() {
        const data = await useSelectAnime()
        return data
    }

    const { data: list = [] } = useQuery({
        queryKey: ['schedule'],
        queryFn: search,
    })

    const renderScene = SceneMap({
        monday: () => <Schedule updateWeekday={1} />,
        tuesday: () => <Schedule updateWeekday={2} />,
        wednesday: () => <Schedule updateWeekday={3} />,
        thursday: () => <Schedule updateWeekday={4} />,
        friday: () => <Schedule updateWeekday={5} />,
        saturday: () => <Schedule updateWeekday={6} />,
        sunday: Notification,
    })

    return (
        <SafeAreaView style={{ flex: 1 }} edges={['top']}>
            <scheduleContext.Provider value={{ list }}>
                <TabView
                    navigationState={{ index, routes }}
                    renderScene={renderScene}
                    onIndexChange={setIndex}
                    initialLayout={{ width: Dimensions.get('window').width }}
                    style={{ backgroundColor: '#fff' }}
                    renderTabBar={(props) => (
                        <TabBar
                            {...props}
                            scrollEnabled
                            tabStyle={{ width: 80, backgroundColor: '#eee' }}
                            activeColor="#000"
                            inactiveColor="#888"
                            indicatorStyle={{ backgroundColor: '#000' }}
                        />
                    )}
                ></TabView>
            </scheduleContext.Provider>
        </SafeAreaView>
    )
}

const styles = StyleSheet.create({
    schedule: {
        padding: 10,
    },
    scheduleItem: {
        flexDirection: 'row',
        marginVertical: 5,
    },
    image: {
        width: 60,
        borderRadius: 5,
        marginRight: 10,
    },
    animeCard: {
        height: (60 * 3) / 2,
        flexDirection: 'row',
        marginBottom: 10,
    },
})
