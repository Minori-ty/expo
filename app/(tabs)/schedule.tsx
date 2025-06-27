import PageHeader from '@/components/PageHeader'
import { IconSymbol } from '@/components/ui/IconSymbol'
import { db } from '@/db'
import { animeTable, selectAnimeSchema } from '@/db/schema'
import { Image } from 'expo-image'
import { useRouter } from 'expo-router'
import React, { useEffect, useState } from 'react'
import { Dimensions, FlatList, StyleSheet, Text, TouchableOpacity, View } from 'react-native'
import { SafeAreaView } from 'react-native-safe-area-context'

const blurhash =
    '|rF?hV%2WCj[ayj[a|j[az_NaeWBj@ayfRayfQfQM{M|azj[azf6fQfQfQIpWXofj[ayj[j[fQayWCoeoeaya}j[ayfQa{oLj?j[WVj[ayayj[fQoff7azayj[ayj[j[ayofayayayj[fQj[ayayj[ayfjj[j[ayjuayj['
type TAnime = typeof animeTable.$inferSelect
const schedule = () => {
    const router = useRouter()
    const [list, setList] = useState<TAnime[]>([])

    async function getAnimeList() {
        const row = await db.select().from(animeTable)
        const list = selectAnimeSchema.array().parse(row)
        setList(list as TAnime[])
    }

    useEffect(() => {
        getAnimeList()
    }, [])
    return (
        <SafeAreaView style={styles.container}>
            <PageHeader
                title="动漫追番"
                actions={[
                    <TouchableOpacity onPress={() => router.push('/addAnime')}>
                        <IconSymbol size={35} name="plus.app.fill" color="black" />
                    </TouchableOpacity>,
                ]}
            />
            {list.length > 0 ? <AnimeContainer list={list} /> : <Empty />}
        </SafeAreaView>
    )
}

export default schedule

function Empty() {
    return (
        <View style={styles.emptyContainer}>
            <Text>暂无动漫数据，请先到右上角添加动漫</Text>
        </View>
    )
}
const GAP = 10
interface IAnimeContainerProps {
    list: TAnime[]
}
function AnimeContainer({ list }: IAnimeContainerProps) {
    return (
        <FlatList
            data={list}
            keyExtractor={(item) => item.id.toString()}
            numColumns={3}
            columnWrapperStyle={{ gap: GAP }}
            contentContainerStyle={{ gap: GAP, paddingHorizontal: GAP }}
            renderItem={({ item }) => <AnimeContainerItem data={item} />}
        />
    )
}

interface IAnimeContainerItemProps {
    data: TAnime
}
function AnimeContainerItem({ data }: IAnimeContainerItemProps) {
    return (
        <View style={styles.animeContainerItem}>
            <View style={styles.imageContainer}>
                <Image
                    style={styles.image}
                    source="https://picsum.photos/seed/696/3000/2000"
                    placeholder={{ blurhash }}
                    contentFit="cover"
                    transition={1000}
                    cachePolicy={'memory-disk'}
                />
                <UpdateLabel isOver={data.isOver} />
            </View>
            <Text>{data.name}</Text>
            <Text>更新 第{data.currentEpisode}集</Text>
        </View>
    )
}
// function AnimeContainer({ list }: IAnimeContainerProps) {
//     const groups = splitIntoGroups(list)
//     return (
//         <ScrollView style={styles.animeContainer}>
//             {groups.map((group, index) => {
//                 return <AnimeContainerItem key={index} group={group} />
//             })}
//         </ScrollView>
//     )
// }

// interface IAnimeContainerItemProps {
//     group: TAnime[]
// }

// function AnimeContainerItem({ group }: IAnimeContainerItemProps) {
//     return (
//         <View style={styles.animeContainerItemWrap}>
//             {group.map((item, index) => {
//                 return (
// <View key={index} style={styles.animeContainerItem}>
//     <View style={styles.imageContainer}>
//         <Image
//             style={styles.image}
//             source="https://picsum.photos/seed/696/3000/2000"
//             placeholder={{ blurhash }}
//             contentFit="cover"
//             transition={1000}
//             cachePolicy={'memory-disk'}
//         />
//         <UpdateLabel isOver={item.isOver} />
//     </View>
//     <Text>{item.name}</Text>
//     <Text>更新 第{item.currentEpisode}集</Text>
// </View>
//                 )
//             })}
//         </View>
//     )
// }
interface IUpdateLabelProps {
    isOver: boolean
}
function UpdateLabel({ isOver }: IUpdateLabelProps) {
    return (
        <View style={[styles.updateLabel, { backgroundColor: isOver ? 'red' : 'skyblue' }]}>
            <Text style={{ color: '#fff' }}>{isOver ? '已完结' : '连载中'}</Text>
        </View>
    )
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
    },
    emptyContainer: {
        flex: 1,
        alignItems: 'center',
        justifyContent: 'center',
    },
    animeContainer: {
        paddingHorizontal: 10,
    },
    animeContainerItemWrap: {
        flexDirection: 'row',
        gap: 10,
        height: 240,
        marginBottom: 10,
    },
    animeContainerItem: {
        height: 240,
        width: (Dimensions.get('window').width - GAP * 4) / 3,
    },
    imageContainer: {
        flex: 1,
        borderRadius: 8,
        overflow: 'hidden',
    },
    image: {
        flex: 1,
    },
    updateLabel: {
        position: 'absolute',
        bottom: 0,
        left: 0,
        height: 25,
        width: 60,
        alignItems: 'center',
        justifyContent: 'center',
    },
    row: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        marginBottom: 8,
    },
})
