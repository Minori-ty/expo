import { getSchedule } from '@/api/anime'
import Empty from '@/components/lottie/Empty'
import { selectAnime } from '@/hooks/useAnime'
import { isCurrentWeekdayUpdateTimePassed } from '@/utils/timeCalculation'
import { useQuery } from '@tanstack/react-query'
import dayjs from 'dayjs'
import customParseFormat from 'dayjs/plugin/customParseFormat'
import isoWeek from 'dayjs/plugin/isoWeek'
import isSameOrBefore from 'dayjs/plugin/isSameOrBefore'
import { Image } from 'expo-image'
import { useRouter } from 'expo-router'
import React, { createContext, useContext, useLayoutEffect, useState } from 'react'
import {
    Dimensions,
    ScrollView,
    StyleSheet,
    Text,
    TouchableOpacity,
    TouchableWithoutFeedback,
    View,
} from 'react-native'
import { SafeAreaView } from 'react-native-safe-area-context'
import { SceneMap, TabBar, TabView } from 'react-native-tab-view'

dayjs.extend(customParseFormat)
dayjs.extend(isSameOrBefore)
dayjs.extend(isoWeek)

interface IScheduleContext {
    list: Awaited<ReturnType<typeof selectAnime>>
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
    const mapSchedule: Record<string, Awaited<ReturnType<typeof selectAnime>>> = {}
    animeList.forEach((item) => {
        if (mapSchedule[item.updateTimeHHmm]) {
            mapSchedule[item.updateTimeHHmm].push(item)
        } else {
            mapSchedule[item.updateTimeHHmm] = [item]
        }
    })
    const updateTimeHHmmList = Object.keys(mapSchedule)
    const sortedTimes = updateTimeHHmmList.sort((a, b) => {
        const timeA = dayjs(`2000-01-01T${a}`).valueOf()
        const timeB = dayjs(`2000-01-01T${b}`).valueOf()
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
    animeList: Awaited<ReturnType<typeof selectAnime>>
}
const blurhash =
    '|rF?hV%2WCj[ayj[a|j[az_NaeWBj@ayfRayfQfQM{M|azj[azf6fQfQfQIpWXofj[ayj[j[fQayWCoeoeaya}j[ayfQa{oLj?j[WVj[ayayj[fQoff7azayj[ayj[j[ayofayayayj[fQj[ayayj[ayfjj[j[ayjuayj['
function ScheduleItem({ time, animeList }: IScheduleItemProps) {
    const router = useRouter()
    return (
        <View style={styles.scheduleItem}>
            <View style={styles.timeBlock}>
                <Text>{time}</Text>
            </View>
            <View style={styles.animeListBlock}>
                {animeList.map((item) => {
                    return (
                        <TouchableOpacity key={item.id} onPress={() => router.push(`/animeDetail/${item.id}`)}>
                            <View style={styles.animeCard}>
                                <Image
                                    style={styles.image}
                                    source={item.cover}
                                    placeholder={{ blurhash }}
                                    contentFit="cover"
                                    transition={1000}
                                    cachePolicy={'memory-disk'}
                                />
                                <View style={styles.animeInfo}>
                                    <Text style={styles.animeTitle}>{item.name}</Text>
                                    <EpisodeTip
                                        updateTimeHHmm={item.updateTimeHHmm}
                                        currentEpisode={item.currentEpisode}
                                        updateWeekday={item.updateWeekday}
                                    />
                                </View>
                            </View>
                        </TouchableOpacity>
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
    if (isCurrentWeekdayUpdateTimePassed(updateTimeHHmm, updateWeekday)) {
        return <Text style={styles.episodeTipPassed}>更新到 第{currentEpisode}集</Text>
    }
    return <Text style={styles.episodeTipSoon}>即将更新 第{currentEpisode} 集</Text>
}

export default function MyTabs() {
    const [index, setIndex] = useState(dayjs().isoWeekday() - 1)
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

    useLayoutEffect(() => {
        setIndex(dayjs().isoWeekday() - 1)
    }, [])

    const renderScene = SceneMap({
        monday: () => <Schedule updateWeekday={1} />,
        tuesday: () => <Schedule updateWeekday={2} />,
        wednesday: () => <Schedule updateWeekday={3} />,
        thursday: () => <Schedule updateWeekday={4} />,
        friday: () => <Schedule updateWeekday={5} />,
        saturday: () => <Schedule updateWeekday={6} />,
        sunday: () => <Schedule updateWeekday={7} />,
    })

    return (
        <SafeAreaView style={styles.safeArea} edges={['top']}>
            <scheduleContext.Provider value={{ list }}>
                <TabView
                    navigationState={{ index, routes }}
                    renderScene={renderScene}
                    onIndexChange={setIndex}
                    initialLayout={{ width: Dimensions.get('window').width }}
                    style={styles.tabViewBg}
                    renderTabBar={(props) => (
                        <TabBar
                            {...props}
                            scrollEnabled
                            tabStyle={styles.tabBarTab}
                            activeColor="#fb7299"
                            inactiveColor="#9E9E9E"
                            style={styles.tabBar}
                            renderTabBarItem={({ route, navigationState, defaultTabWidth, onPress }) => {
                                const focused = navigationState.routes[navigationState.index].key === route.key

                                return (
                                    <TouchableWithoutFeedback onPress={onPress}>
                                        <View
                                            style={[
                                                styles.tabBarItem,
                                                { width: defaultTabWidth },
                                                focused && styles.tabBarItemFocused,
                                            ]}
                                        >
                                            <Text
                                                style={[
                                                    styles.tabBarItemTitle,
                                                    focused && styles.tabBarItemTitleFocused,
                                                ]}
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
    safeArea: {
        flex: 1,
    },
    tabViewBg: {
        backgroundColor: '#fff',
    },
    schedule: {
        padding: 10,
    },
    scheduleItem: {
        flexDirection: 'row',
        marginVertical: 5,
    },
    timeBlock: {
        width: 60,
        justifyContent: 'flex-start',
        alignItems: 'center',
    },
    animeListBlock: {
        flex: 1,
    },
    image: {
        width: coverWidth,
        borderRadius: 5,
        marginRight: 10,
        height: coverWidth * 1.5,
    },
    animeCard: {
        height: coverWidth * (3 / 2),
        flexDirection: 'row',
        marginBottom: 10,
        flex: 1,
    },
    animeInfo: {
        flex: 1,
    },
    animeTitle: {
        fontWeight: '900',
    },
    episodeTipPassed: {
        marginTop: 5,
        color: '#fb7299',
        fontSize: 12,
    },
    episodeTipSoon: {
        marginTop: 5,
        color: '#9E9E9E',
        fontSize: 12,
    },
    tabBar: {
        elevation: 0, // 移除 Android 阴影
        shadowOpacity: 0, // 移除 iOS 阴影
        shadowRadius: 0, // 移除 iOS 阴影
        shadowOffset: { height: 0, width: 0 }, // 移除 iOS 阴影
        borderBottomWidth: 0, // 移除可能的底部边框
        backgroundColor: '#fff',
    },
    tabBarTab: {
        width: 80,
        backgroundColor: '#fff',
    },
    tabBarItem: {
        height: 50,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: '#fff',
    },
    tabBarItemFocused: {},
    tabBarItemTitle: {
        color: '#9E9E9E',
        fontWeight: '400',
        fontSize: 18,
        textAlign: 'center',
    },
    tabBarItemTitleFocused: {
        color: '#fb7299',
        fontWeight: '800',
        fontSize: 24,
    },
})
