import { useSelectAnimeById } from '@/hooks/useAnime'
import dayjs from 'dayjs'
import 'dayjs/locale/zh-cn'
import { Image as ExpoImage } from 'expo-image'
import { useLocalSearchParams, useNavigation } from 'expo-router'
import React, { useEffect, useState } from 'react'
import { SafeAreaView, ScrollView, StyleSheet, Text, View } from 'react-native'

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

const AnimeDetail = () => {
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
    useEffect(() => {
        navigation.setOptions({
            headerTitle: '动漫详情',
            headerTitleAlign: 'center',
        })
    }, [navigation])
    const { id } = useLocalSearchParams()

    async function getAnimeDetail() {
        if (typeof id === 'string') {
            const data = await useSelectAnimeById(Number(id))
            setAnime(data)
        }
    }
    useEffect(() => {
        getAnimeDetail()
    }, [])

    const getUpdateInfo = () => {
        const weekday = weekdayMap[anime.updateWeekday - 1]
        return `每周${weekday} ${anime.updateTimeHHmm}更新`
    }

    return (
        <SafeAreaView style={styles.container}>
            <ScrollView contentContainerStyle={styles.scrollView}>
                {/* 封面图 */}
                <View style={styles.coverContainer}>
                    <ExpoImage source={{ uri: anime.cover }} style={styles.coverImage} contentFit="cover" />
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
    placeholder: {
        backgroundColor: '#e0e0e0',
    },
    infoContainer: {
        marginBottom: 20,
    },
    title: {
        fontSize: 24,
        fontWeight: 'bold',
        marginBottom: 8,
    },
    episodeInfo: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 8,
    },
    episodeText: {
        fontSize: 16,
        marginRight: 12,
        color: '#333',
    },
    updateInfo: {
        fontSize: 16,
        color: '#007AFF',
    },
    dateInfo: {
        flexDirection: 'column',
    },
    dateText: {
        fontSize: 14,
        color: '#666',
        marginBottom: 4,
    },
    summaryContainer: {
        backgroundColor: '#f9f9f9',
        borderRadius: 10,
        padding: 16,
    },
    sectionTitle: {
        fontSize: 18,
        fontWeight: 'bold',
        marginBottom: 8,
    },
    summaryText: {
        fontSize: 16,
        lineHeight: 24,
        color: '#333',
    },
})

export default AnimeDetail
