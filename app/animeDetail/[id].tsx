import ProgressBar from '@/components/ProgressBar'
import { IconSymbol } from '@/components/ui/IconSymbol'
import { EStatus, EUpdateWeekday } from '@/db/schema'
import { selectAnimeById } from '@/hooks/useAnime'
import dayjs from 'dayjs'
import 'dayjs/locale/zh-cn'
import { Enum } from 'enum-plus'
import { Image } from 'expo-image'
import { useLocalSearchParams, useNavigation, useRouter } from 'expo-router'
import React, { useCallback, useEffect, useLayoutEffect, useState } from 'react'
import { SafeAreaView, ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native'

dayjs.locale('zh-cn')

interface Anime {
    firstEpisodeDateTime: string
    lastEpisodeDateTime: string
    createdAt: string
    id: number
    name: string
    updateWeekday: EUpdateWeekday
    updateTimeHHmm: string
    currentEpisode: number
    totalEpisode: number
    status: EStatus
    cover: string
}

const weekdayMap = ['一', '二', '三', '四', '五', '六', '日']

function AnimeDetail() {
    const [anime, setAnime] = useState<Anime>({
        firstEpisodeDateTime: '-',
        lastEpisodeDateTime: '-',
        createdAt: '-',
        id: -1,
        name: '-',
        updateWeekday: 1,
        updateTimeHHmm: '-',
        currentEpisode: 0,
        totalEpisode: 0,
        status: EStatus.ONGOING,
        cover: '-',
    })

    const navigation = useNavigation()
    const router = useRouter()
    useLayoutEffect(() => {
        navigation.setOptions({
            headerTitle: '动漫详情',
            headerTitleAlign: 'center',
            headerRight: () => {
                return (
                    <TouchableOpacity onPress={() => router.push(`/editAnime/${anime.id}`)}>
                        <IconSymbol size={28} name="text.append" color={'black'} />
                    </TouchableOpacity>
                )
            },
        })
    }, [navigation, anime.id, router])
    const { id } = useLocalSearchParams()

    const getAnimeDetail = useCallback(async () => {
        if (typeof id === 'string') {
            const data = await selectAnimeById(Number(id))
            setAnime(data)
        }
    }, [id])
    useEffect(() => {
        getAnimeDetail()
    }, [getAnimeDetail])

    const getUpdateInfo = () => {
        const weekday = weekdayMap[anime.updateWeekday - 1]
        return `每周${weekday} ${anime.updateTimeHHmm}更新`
    }
    const blurhash =
        '|rF?hV%2WCj[ayj[a|j[az_NaeWBj@ayfRayfQfQM{M|azj[azf6fQfQfQIpWXofj[ayj[j[fQayWCoeoeaya}j[ayfQa{oLj?j[WVj[ayayj[fQoff7azayj[ayj[j[ayofayayayj[fQj[ayayj[ayfjj[j[ayjuayj['

    const mapColor = {
        [EStatus.COMING_SOON]: '#FFD547',
        [EStatus.ONGOING]: '#409eff',
        [EStatus.COMPLETED]: '#f56c6c',
    }

    const mapText = {
        [EStatus.COMING_SOON]: '即将更新',
        [EStatus.ONGOING]: '连载中',
        [EStatus.COMPLETED]: '已完结',
    }
    const statusMap = Enum({
        Complete: {
            value: 1,
            label: '已完结',
            color: '#f56c6c',
        },
        Ongoing: {
            value: 2,
            label: '连载中',
            color: '#409eff',
        },
        ComingSoon: {
            value: 3,
            label: '即将更新',
            color: '#FFD547',
        },
    } as const)
    console.log(statusMap.raw(1).color)

    return (
        <SafeAreaView style={styles.container}>
            <ScrollView contentContainerStyle={styles.scrollView}>
                {/* 封面图 */}
                <View style={styles.coverContainer}>
                    <Image
                        source={{ uri: anime.cover }}
                        style={styles.coverImage}
                        contentFit="cover"
                        placeholder={{ blurhash }}
                    />
                </View>

                <View style={{ paddingHorizontal: 15 }}>
                    <View style={{ flexDirection: 'row', alignItems: 'flex-end' }}>
                        <Text style={styles.name}>{anime.name}</Text>
                        <View
                            style={{
                                backgroundColor: statusMap.raw(anime.status).color,
                                paddingHorizontal: 5,
                                paddingVertical: 2,
                                borderRadius: 5,
                                marginLeft: 5,
                            }}
                        >
                            <Text style={{ color: '#fff', fontSize: 10 }}>{statusMap.raw(anime.status).label}</Text>
                        </View>
                    </View>
                    <View style={[styles.border, styles.dateContainer]}>
                        <View style={styles.dateBox}>
                            <IconSymbol size={16} name="calendar" color={'#6b7280'} />
                            <View style={styles.date}>
                                <Text>更新时间</Text>
                                <Text>周一</Text>
                            </View>
                        </View>
                        <View style={styles.dateBox}>
                            <IconSymbol size={20} name="alarm" color={'#6b7280'} />
                            <View style={styles.date}>
                                <Text>更新时刻</Text>
                                <Text>{anime.updateTimeHHmm}</Text>
                            </View>
                        </View>
                    </View>

                    <View style={[styles.progressContainer, styles.border]}>
                        <View style={styles.progressTitle}>
                            <Text>播放进度</Text>
                            <Text>
                                {anime.currentEpisode}/{anime.totalEpisode}
                            </Text>
                        </View>
                        <ProgressBar progress={anime.currentEpisode / anime.totalEpisode} />
                        <View style={styles.progressTitle}>
                            <Text>已更新{anime.currentEpisode}集</Text>
                            <Text>{Math.round((anime.currentEpisode / anime.totalEpisode) * 100)}%完成</Text>
                        </View>
                    </View>

                    {/* <View style={[styles.border]}><CustomDatepicker /></View> */}
                </View>
            </ScrollView>
        </SafeAreaView>
    )
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#f9fafb',
    },
    scrollView: {
        // padding: 16,
        paddingBottom: 20,
    },
    coverContainer: {
        width: '100%',
        height: 250,
        // borderRadius: 12,
        overflow: 'hidden',
    },
    coverImage: {
        width: '100%',
        height: '100%',
    },
    name: {
        fontSize: 25,
        marginTop: 15,
        fontWeight: '800',
    },
    progressContainer: {
        marginTop: 15,
    },
    progressTitle: {
        flexDirection: 'row',
        justifyContent: 'space-between',
    },
    border: {
        padding: 15,
        borderRadius: 10,
        backgroundColor: '#fff',
        borderWidth: 1,
        borderColor: '#e5e7eb',
        marginTop: 15,
    },
    dateContainer: {
        flexDirection: 'row',
        marginTop: 15,
    },
    dateBox: {
        flex: 1,
        flexDirection: 'row',
        alignItems: 'center',
    },
    date: {
        marginLeft: 5,
    },
})

export default AnimeDetail
