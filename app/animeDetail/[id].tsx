import { IconSymbol } from '@/components/ui/IconSymbol'
import { selectAnimeById } from '@/hooks/useAnime'
import dayjs from 'dayjs'
import 'dayjs/locale/zh-cn'
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
    updateWeekday: 1 | 2 | 3 | 4 | 5 | 6 | 7
    updateTimeHHmm: string
    currentEpisode: number
    totalEpisode: number
    isFinished: boolean
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
        isFinished: false,
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

                {/* 基本信息 */}
                <View style={styles.infoContainer}>
                    <Text style={styles.title}>{anime.name}</Text>

                    <View>
                        <Text>当前更新第 {anime.currentEpisode} 集</Text>
                        <Text>总集数 {anime.totalEpisode} 话</Text>
                        <Text>{getUpdateInfo()}</Text>
                    </View>

                    <View style={styles.dateInfo}>
                        <Text style={styles.dateText}>首播时间: {anime.firstEpisodeDateTime}</Text>
                        <Text style={styles.dateText}>完结时间: {anime.lastEpisodeDateTime}</Text>
                    </View>
                </View>
            </ScrollView>
        </SafeAreaView>
    )
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#fff',
    },
    scrollView: {
        padding: 16,
    },
    coverContainer: {
        width: '100%',
        height: 250,
        borderRadius: 12,
        overflow: 'hidden',
        marginBottom: 16,
    },
    coverImage: {
        width: '100%',
        height: '100%',
    },

    infoContainer: {
        marginBottom: 20,
    },
    title: {
        fontSize: 24,
        fontWeight: 'bold',
        marginBottom: 8,
    },

    dateInfo: {
        flexDirection: 'column',
    },
    dateText: {
        fontSize: 14,
        color: '#666',
        marginBottom: 4,
    },
})

export default AnimeDetail
