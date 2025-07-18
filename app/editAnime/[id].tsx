import { updateAnime } from '@/api'
import BaseAnimeForm, { hasFirstEpisodeDateTime, TFormData, type IBaseAnimeFormProps } from '@/components/BaseAnimeForm'
import { EStatus, EUpdateWeekday } from '@/db/schema'
import { selectAnimeById } from '@/hooks/useAnime'
import { queryClient } from '@/utils/react-query'
import { useMutation } from '@tanstack/react-query'
import dayjs from 'dayjs'
import { router, useLocalSearchParams, useNavigation } from 'expo-router'
import React, { useCallback, useEffect, useState } from 'react'

function EditAnime() {
    const navigation = useNavigation()
    useEffect(() => {
        navigation.setOptions({
            headerTitle: '编辑动漫信息',
            headerTitleAlign: 'center',
        })
    }, [navigation])
    const [anime, setAnime] = useState<IBaseAnimeFormProps['formData']>({
        name: '-',
        updateWeekday: EUpdateWeekday.MONDAY,
        updateTimeHHmm: dayjs().format('YYYY-MM-DD HH:mm'),
        currentEpisode: 0,
        totalEpisode: 0,
        status: EStatus.COMPLETED,
        cover: '-',
        firstEpisodeDateTimeYYYYMMDDHHmm: dayjs().format('YYYY-MM-DD HH:mm'),
    })
    const { id } = useLocalSearchParams()
    const getAnimeDetail = useCallback(async () => {
        if (typeof id === 'string') {
            const { name, updateWeekday, currentEpisode, totalEpisode, status, cover, firstEpisodeDateTime } =
                await selectAnimeById(Number(id))

            setAnime({
                name,
                updateWeekday,
                updateTimeHHmm: firstEpisodeDateTime,
                currentEpisode,
                totalEpisode,
                status,
                cover,
                firstEpisodeDateTimeYYYYMMDDHHmm: firstEpisodeDateTime,
            })
        }
    }, [id])
    useEffect(() => {
        getAnimeDetail()
    }, [getAnimeDetail])

    const { mutate: updateAnimeMution } = useMutation({
        mutationFn: updateAnime,
        onSuccess: () => {
            queryClient.invalidateQueries({
                queryKey: ['anime-detail'],
            })
            queryClient.invalidateQueries({
                queryKey: ['my-anime'],
            })
            queryClient.invalidateQueries({
                queryKey: ['schedule'],
            })
            queryClient.invalidateQueries({
                queryKey: ['anime-detail'],
            })
            router.back()
        },
        onError: err => {
            alert(err)
        },
    })

    async function onSubmit(data: TFormData) {
        const { cover, name, status, totalEpisode, updateTimeHHmm } = data
        const HHmm = dayjs(updateTimeHHmm).format('HH:mm')
        if (hasFirstEpisodeDateTime(data)) {
            const { firstEpisodeDateTimeYYYYMMDDHHmm } = data
            const firstEpisodeDateTimeTimestamp = dayjs(`${firstEpisodeDateTimeYYYYMMDDHHmm}`).unix()
            updateAnimeMution({
                cover,
                name,
                status,
                totalEpisode,
                updateTimeHHmm: HHmm,
                firstEpisodeDateTime: firstEpisodeDateTimeTimestamp,
                id: Number(id),
            })
        } else {
            const { currentEpisode, updateWeekday } = data
            updateAnimeMution({
                cover,
                currentEpisode,
                name,
                status,
                totalEpisode,
                updateTimeHHmm: HHmm,
                updateWeekday,
                id: Number(id),
            })
        }
    }

    return <BaseAnimeForm formData={anime} onSubmit={onSubmit} />
}

export default EditAnime
