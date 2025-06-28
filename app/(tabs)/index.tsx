import { getSchedule } from '@/api/anime'
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
            <View style={{ width: 60, justifyContent: 'flex-start', alignItems: 'center' }}>
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
                                <EpisodeTip updateTimeHHmm={item.updateTimeHHmm} currentEpisode={item.currentEpisode} />
                            </View>
                        </View>
                    )
                })}
            </View>
        </View>
    )
}

interface IEpisodeTipProps {
    updateTimeHHmm: string
    currentEpisode: number
}
function EpisodeTip({ updateTimeHHmm, currentEpisode }: IEpisodeTipProps) {
    if (isTimePassed(updateTimeHHmm)) {
        return <Text style={{ marginTop: 5, color: '#fb7299', fontSize: 12 }}>更新到 第{currentEpisode}集</Text>
    }
    return <Text style={{ marginTop: 5, color: '#9E9E9E', fontSize: 12 }}>即将更新 第{currentEpisode}集</Text>
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
        const data = await getSchedule()
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
                            tabStyle={{ width: 80, backgroundColor: '#fff' }}
                            activeColor="#fb7299"
                            inactiveColor="#9E9E9E"
                            style={styles.tabBar}
                            renderTabBarItem={({ route, navigationState }) => {
                                const focused = navigationState.routes[navigationState.index].key === route.key
                                return (
                                    <Text
                                        style={{
                                            color: focused ? '#fb7299' : '#9E9E9E',
                                            fontWeight: focused ? '900' : '800',
                                            fontSize: focused ? 18 : 16,
                                            textAlign: 'center',
                                        }}
                                    >
                                        {route.title}
                                    </Text>
                                )
                            }}
                        />
                    )}
                ></TabView>
            </scheduleContext.Provider>
        </SafeAreaView>
    )
}

const coverWidth = 60
const styles = StyleSheet.create({
    schedule: {
        padding: 10,
    },
    scheduleItem: {
        flexDirection: 'row',
        marginVertical: 5,
    },
    image: {
        width: coverWidth,
        borderRadius: 5,
        marginRight: 10,
    },
    animeCard: {
        height: coverWidth * (3 / 2),
        flexDirection: 'row',
        marginBottom: 10,
    },
    tabBar: {
        elevation: 0, // 移除 Android 阴影
        shadowOpacity: 0, // 移除 iOS 阴影
        shadowRadius: 0, // 移除 iOS 阴影
        shadowOffset: { height: 0, width: 0 }, // 移除 iOS 阴影
        borderBottomWidth: 0, // 移除可能的底部边框
    },
})

/**
 * 判断给定的时间字符串是否已超过当前时间
 * @param  timeStr - 格式为 "HH:mm" 的时间字符串
 * @returns - 如果给定时间已过，返回 true；否则返回 false
 */
function isTimePassed(timeStr: string) {
    // 验证输入格式
    if (!/^\d{2}:\d{2}$/.test(timeStr)) {
        throw new Error('时间格式必须为 "HH:mm"')
    }

    // 解析输入时间
    const [hours, minutes] = timeStr.split(':').map(Number)
    const targetTime = dayjs().set('hour', hours).set('minute', minutes).set('second', 0).set('millisecond', 0)

    // 如果解析后的时间比当前时间早，则视为明天的时间
    const now = dayjs()
    let adjustedTime = targetTime
    if (targetTime.isBefore(now)) {
        adjustedTime = targetTime.add(1, 'day')
    }

    // 判断调整后的时间是否已过
    return adjustedTime.isBefore(now)
}
