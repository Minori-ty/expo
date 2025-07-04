import { deleteAnime } from '@/api'
import CustomModal from '@/components/CustomModal'
import PageHeader from '@/components/PageHeader'
import { IconSymbol } from '@/components/ui/IconSymbol'
import { EStatus } from '@/db/schema'
import { selectAnime } from '@/hooks/useAnime'
import { queryClient } from '@/utils/react-query'
import { useMutation, useQuery } from '@tanstack/react-query'
import { Image } from 'expo-image'
import { useRouter } from 'expo-router'
import React, { createContext, useContext, useState } from 'react'
import { Dimensions, FlatList, Pressable, StyleSheet, Text, TouchableOpacity, View } from 'react-native'
import { SafeAreaView } from 'react-native-safe-area-context'

const blurhash =
    '|rF?hV%2WCj[ayj[a|j[az_NaeWBj@ayfRayfQfQM{M|azj[azf6fQfQfQIpWXofj[ayj[j[fQayWCoeoeaya}j[ayfQa{oLj?j[WVj[ayayj[fQoff7azayj[ayj[j[ayofayayayj[fQj[ayayj[ayfjj[j[ayjuayj['

interface ModalContextValue {
    modalVisible: boolean
    setModalVisible: React.Dispatch<React.SetStateAction<boolean>>
    animeData: { name: string; id: number }
    setAnimeData: React.Dispatch<
        React.SetStateAction<{
            name: string
            id: number
        }>
    >
}

const ModalContext = createContext<ModalContextValue | undefined>(undefined)

const useModal = () => {
    const ctx = useContext(ModalContext)
    if (!ctx) throw new Error('useModal must be used within ModalProvider')
    return ctx
}

function Schedual() {
    const [modalVisible, setModalVisible] = useState(false)
    const [animeData, setAnimeData] = useState({
        name: '',
        id: -1,
    })
    const router = useRouter()
    async function search() {
        const data = await selectAnime()
        return data
    }

    const { data: list = [] } = useQuery({
        queryKey: ['my-anime'],
        queryFn: search,
    })

    async function onDeleteAnime() {
        const result = await deleteAnime(animeData.id)
        setModalVisible(false)
        return result
    }

    const { mutate: deleteItem } = useMutation({
        mutationFn: onDeleteAnime,
        onSuccess: () => {
            queryClient.invalidateQueries({
                queryKey: ['search'],
            })
            queryClient.invalidateQueries({
                queryKey: ['my-anime'],
            })
            queryClient.invalidateQueries({
                queryKey: ['schedule'],
            })
        },
    })

    return (
        <ModalContext.Provider value={{ modalVisible, setModalVisible, animeData, setAnimeData }}>
            <SafeAreaView style={styles.container} edges={['top']}>
                <PageHeader
                    title="动漫追番"
                    actions={[
                        <TouchableOpacity onPress={() => router.push('/addAnime')} key={'header'}>
                            <IconSymbol size={35} name="plus.app.fill" color="black" />
                        </TouchableOpacity>,
                    ]}
                />
                {list.length > 0 ? <AnimeContainer list={list} /> : <Empty />}
            </SafeAreaView>
            <CustomModal visible={modalVisible} onClose={() => setModalVisible(false)}>
                <View style={styles.modalPanel} pointerEvents="box-none">
                    <View>
                        <Text style={styles.modalHeader}>确认删除</Text>
                        <Text style={{ fontSize: 14 }}>你确定要删除 &quot;{animeData.name}&quot; 吗？</Text>
                    </View>
                    <View style={styles.modalFooter}>
                        <View style={styles.modalButtonWrapper}>
                            <Pressable onPress={() => setModalVisible(false)} style={styles.buttonWrapper}>
                                <Text style={styles.modalButton}>取消</Text>
                            </Pressable>
                        </View>
                        <View style={styles.modalButtonWrapper}>
                            <Pressable onPress={() => deleteItem()} style={styles.buttonWrapper}>
                                <Text style={styles.modalButton}>删除</Text>
                            </Pressable>
                        </View>
                    </View>
                </View>
            </CustomModal>
        </ModalContext.Provider>
    )
}

export default Schedual

function Empty() {
    return (
        <View style={styles.emptyContainer}>
            <Text>暂无动漫数据，请先到右上角添加动漫</Text>
        </View>
    )
}
const GAP = 10
interface IAnimeContainerProps {
    list: Awaited<ReturnType<typeof selectAnime>>
}
function AnimeContainer({ list }: IAnimeContainerProps) {
    return (
        <FlatList
            data={list}
            keyExtractor={(item) => item.id.toString()}
            numColumns={3}
            columnWrapperStyle={{ gap: GAP }}
            showsHorizontalScrollIndicator={false}
            showsVerticalScrollIndicator={false}
            contentContainerStyle={{ gap: GAP, paddingHorizontal: GAP }}
            renderItem={({ item }) => <AnimeContainerItem data={item} />}
        />
    )
}

interface IAnimeContainerItemProps {
    data: Awaited<ReturnType<typeof selectAnime>>[number]
}
function AnimeContainerItem({ data }: IAnimeContainerItemProps) {
    const { setModalVisible, setAnimeData } = useModal()
    const router = useRouter()
    function toAnimeDetail() {
        router.push(`/animeDetail/${data.id}`)
    }
    return (
        <Pressable
            style={styles.animeContainerItem}
            onPress={toAnimeDetail}
            onLongPress={() => {
                setModalVisible(true)
                setAnimeData({
                    name: data.name,
                    id: data.id,
                })
            }}
            delayLongPress={300}
        >
            <View style={styles.imageContainer}>
                <Image
                    style={styles.image}
                    source={data.cover}
                    placeholder={{ blurhash }}
                    contentFit="cover"
                    transition={1000}
                    cachePolicy={'memory-disk'}
                />
                <UpdateLabel status={data.status} />
            </View>
            <Text style={styles.text}>{data.name}</Text>
            <Text style={styles.text}>更新 第{data.currentEpisode}集</Text>
        </Pressable>
    )
}

interface IUpdateLabelProps {
    status: EStatus
}
function UpdateLabel({ status }: IUpdateLabelProps) {
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
    return (
        <View style={[styles.updateLabel, { backgroundColor: mapColor[status] }]}>
            <Text style={{ color: '#fff' }}>{mapText[status]}</Text>
        </View>
    )
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#fff',
    },
    emptyContainer: {
        flex: 1,
        alignItems: 'center',
        justifyContent: 'center',
    },
    animeContainerItem: {
        height: 215,
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
        alignItems: 'center',
        justifyContent: 'center',
        paddingHorizontal: 10,
    },
    text: {
        fontSize: 12,
        marginTop: 5,
        wordWrap: 'nowrap',
        overflow: 'hidden',
        textOverflow: 'ellipsis',
    },
    modalPanel: {
        backgroundColor: '#fff',
        paddingHorizontal: 20,
        paddingTop: 30,
        paddingBottom: 40,
        borderRadius: 25,
        width: 300,
    },
    modalHeader: {
        fontSize: 20,
        marginBottom: 15,
    },
    modalFooter: {
        justifyContent: 'flex-end',
        flexDirection: 'row',
        marginTop: 20,
    },
    modalButton: {
        color: '#6c5ce7',
        fontSize: 14,
    },
    modalButtonWrapper: {
        // marginHorizontal: 20,
    },
    buttonWrapper: {
        width: 60,
        height: 30,
        justifyContent: 'center',
        alignItems: 'center',
    },
})
