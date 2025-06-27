import PageHeader from '@/components/PageHeader'
import { IconSymbol } from '@/components/ui/IconSymbol'
import { db } from '@/db'
import { animeTable, selectAnimeSchema } from '@/db/schema'
import { useRouter } from 'expo-router'
import React, { useEffect, useState } from 'react'
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native'
import { SafeAreaView } from 'react-native-safe-area-context'

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

interface IAnimeContainerProps {
    list: TAnime[]
}
function AnimeContainer({ list }: IAnimeContainerProps) {
    const groups = splitIntoGroups(list)
    return (
        <>
            {groups.map((group, index) => {
                return <AnimeContainerItem key={index} group={group} />
            })}
        </>
    )
}

interface IAnimeContainerItemProps {
    group: TAnime[]
}
function AnimeContainerItem({ group }: IAnimeContainerItemProps) {
    return (
        <View style={styles.animeContainerItemWrap}>
            {group.map((item, index) => {
                return (
                    <View key={index} style={styles.animeContainerItem}>
                        <Text>{item.name}</Text>
                    </View>
                )
            })}
        </View>
    )
}

type ElementType<T> = T extends (infer U)[] ? U : never
function splitIntoGroups<T extends any[]>(data: T): ElementType<T>[][] {
    const groups = []
    const length = data.length

    for (let i = 0; i < length; i += 3) {
        groups.push(data.slice(i, i + 3))
    }

    return groups
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
    animeContainerItemWrap: {
        flexDirection: 'row',
    },
    animeContainerItem: {
        flex: 1,
    },
})
