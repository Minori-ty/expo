import { getSchedule } from '@/api/anime'
import Empty from '@/components/lottie/Empty'
import { useSelectAnime } from '@/hooks/useAnime'
import Notification from '@/utils/Notification'
import { useQuery } from '@tanstack/react-query'
import dayjs from 'dayjs'
import customParseFormat from 'dayjs/plugin/customParseFormat'
import isSameOrBefore from 'dayjs/plugin/isSameOrBefore'
import weekday from 'dayjs/plugin/weekday'
import { Image } from 'expo-image'
import React, { createContext, useContext, useEffect, useState } from 'react'
import { Dimensions, ScrollView, StyleSheet, Text, TouchableWithoutFeedback, View } from 'react-native'
import { SafeAreaView } from 'react-native-safe-area-context'
import { SceneMap, TabBar, TabView } from 'react-native-tab-view'

dayjs.extend(customParseFormat)
dayjs.extend(isSameOrBefore)
dayjs.extend(weekday)

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
        <ScrollView style={styles.schedule} showsVerticalScrollIndicator={false} showsHorizontalScrollIndicator={false}>
            {sortedTimes.map((time, index) => {
                return <ScheduleItem time={time} animeList={mapSchedule[time]} key={index} />
            })}
        </ScrollView>
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
                                source={item.cover}
                                placeholder={{ blurhash }}
                                contentFit="cover"
                                transition={1000}
                                cachePolicy={'memory-disk'}
                            />
                            <View style={{ flex: 1 }}>
                                <Text style={{ fontWeight: '900' }}>{item.name}</Text>
                                <EpisodeTip
                                    updateTimeHHmm={item.updateTimeHHmm}
                                    currentEpisode={item.currentEpisode}
                                    updateWeekday={item.updateWeekday}
                                />
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
    updateWeekday: number
}
function EpisodeTip({ updateTimeHHmm, currentEpisode, updateWeekday }: IEpisodeTipProps) {
    if (isTimePassed(updateTimeHHmm, updateWeekday)) {
        return <Text style={{ marginTop: 5, color: '#fb7299', fontSize: 12 }}>更新到 第{currentEpisode}集</Text>
    }
    return <Text style={{ marginTop: 5, color: '#9E9E9E', fontSize: 12 }}>即将更新 第{currentEpisode} 集</Text>
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

    useEffect(() => {
        setIndex(dayjs().weekday())
    }, [])
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
                            renderTabBarItem={({ route, navigationState, defaultTabWidth, onPress }) => {
                                const focused = navigationState.routes[navigationState.index].key === route.key
                                return (
                                    <TouchableWithoutFeedback onPress={onPress}>
                                        <View
                                            style={{
                                                width: defaultTabWidth,
                                                height: 50,
                                                justifyContent: 'center',
                                                alignItems: 'center',
                                                backgroundColor: '#fff',
                                            }}
                                        >
                                            <Text
                                                style={{
                                                    color: focused ? '#fb7299' : '#9E9E9E',
                                                    fontWeight: focused ? '900' : '400',
                                                    fontSize: focused ? 24 : 18,
                                                    textAlign: 'center',
                                                }}
                                            >
                                                {route.title}
                                            </Text>
                                        </View>
                                    </TouchableWithoutFeedback>
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
        flex: 1,
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
 * 判断当前时间是否超过了给定的时间
 * @param updateTimeHHmm
 * @param currentEpisode
 * @returns
 */
function isTimePassed(updateTimeHHmm: string, updateWeekday: number) {
    // 获取当前时间
    const now = dayjs()

    // 解析输入的时间字符串
    const [hours, minutes] = updateTimeHHmm.split(':').map(Number)

    // 计算目标时间：本周指定星期的指定时间
    const target = now.day(updateWeekday).hour(hours).minute(minutes).second(0).millisecond(0)

    // 如果计算出的目标时间在当前时间之前，返回 true
    // 如果目标时间是未来的时间，则返回 false
    return now.isAfter(target)
}
