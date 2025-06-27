import PageHeader from '@/components/PageHeader'
import { IconSymbol } from '@/components/ui/IconSymbol'
import { useDeleteAnime, useSelectAnime } from '@/hooks/useAnime'
import { queryClient } from '@/utils/react-query'
import { useMutation, useQuery } from '@tanstack/react-query'
import { Image } from 'expo-image'
import { useRouter } from 'expo-router'
import React, { createContext, useContext, useState } from 'react'
import {
    Dimensions,
    FlatList,
    Modal,
    Pressable,
    StyleSheet,
    Text,
    TouchableOpacity,
    TouchableWithoutFeedback,
    View,
} from 'react-native'
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
        const data = await useSelectAnime()
        return data
    }

    const { data: list = [] } = useQuery({
        queryKey: ['my-anime'],
        queryFn: search,
    })

    async function deleteAnime() {
        const result = await useDeleteAnime(animeData.id)
        setModalVisible(false)
        return result
    }

    const { mutate: deleteItem } = useMutation({
        mutationFn: deleteAnime,
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
                        <TouchableOpacity onPress={() => router.push('/addAnime')}>
                            <IconSymbol size={35} name="plus.app.fill" color="black" />
                        </TouchableOpacity>,
                    ]}
                />
                {list.length > 0 ? <AnimeContainer list={list} /> : <Empty />}
                <Modal
                    visible={modalVisible}
                    transparent
                    animationType="fade"
                    onRequestClose={() => setModalVisible(false)}
                >
                    <TouchableWithoutFeedback onPress={() => setModalVisible(false)}>
                        <View style={styles.modalBackground}>
                            <View style={styles.modalPanel}>
                                <View style={styles.modalContent}>
                                    <Text style={styles.modalHeader}>确认删除</Text>
                                    <Text style={{ fontSize: 14 }}>你确定要删除 "{animeData.name}" 吗？</Text>
                                </View>
                                <View style={styles.modalFooter}>
                                    <View style={styles.modalButtonWrapper}>
                                        <Pressable onPress={() => setModalVisible(false)}>
                                            <Text style={styles.modalButton}>取消</Text>
                                        </Pressable>
                                    </View>
                                    <View style={styles.modalButtonWrapper}>
                                        <Pressable onPress={() => deleteItem()}>
                                            <Text style={styles.modalButton}>删除</Text>
                                        </Pressable>
                                    </View>
                                </View>
                            </View>
                        </View>
                    </TouchableWithoutFeedback>
                </Modal>
            </SafeAreaView>
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
    list: Awaited<ReturnType<typeof useSelectAnime>>
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
    data: Awaited<ReturnType<typeof useSelectAnime>>[number]
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
                    source="https://picsum.photos/seed/696/3000/2000"
                    placeholder={{ blurhash }}
                    contentFit="cover"
                    transition={1000}
                    cachePolicy={'memory-disk'}
                />
                <UpdateLabel isOver={data.isFinished} />
            </View>
            <Text style={styles.text}>{data.name}</Text>
            <Text style={styles.text}>更新 第{data.currentEpisode}集</Text>
        </Pressable>
    )
}

interface IUpdateLabelProps {
    isOver: boolean
}
function UpdateLabel({ isOver }: IUpdateLabelProps) {
    return (
        <View style={[styles.updateLabel, { backgroundColor: isOver ? '#f56c6c' : '#409eff' }]}>
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
    animeContainerItem: {
        height: 210,
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
    text: {
        fontSize: 12,
    },
    modalBackground: {
        flex: 1,
        backgroundColor: 'rgba(0,0,0,0.3)',
        justifyContent: 'center',
        alignItems: 'center',
    },
    modalPanel: {
        backgroundColor: '#fff',
        paddingHorizontal: 20,
        paddingTop: 30,
        paddingBottom: 40,
        borderRadius: 25,
        width: 300,
    },
    closeButton: {
        marginTop: 20,
        padding: 10,
        backgroundColor: '#eee',
        borderRadius: 8,
    },
    modalHeader: {
        fontSize: 20,
        marginBottom: 15,
    },
    modalContent: {},
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
        marginHorizontal: 20,
    },
})
