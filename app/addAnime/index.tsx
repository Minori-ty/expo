import { addAnime } from '@/api'
import BaseAnimeForm, { hasFirstEpisodeDateTime, TFormData, type IBaseAnimeFormProps } from '@/components/BaseAnimeForm'
import { EStatus, EUpdateWeekday } from '@/db/schema'
import { queryClient } from '@/utils/react-query'
import { useMutation } from '@tanstack/react-query'
import dayjs from 'dayjs'
import { router, useNavigation } from 'expo-router'
import React, { useLayoutEffect } from 'react'

function EditAnime() {
    const navigation = useNavigation()
    useLayoutEffect(() => {
        navigation.setOptions({
            headerTitle: '添加动漫',
            headerTitleAlign: 'center',
        })
    }, [navigation])

    const initialFormData: IBaseAnimeFormProps['formData'] = {
        name: '',
        updateWeekday: EUpdateWeekday.MONDAY,
        updateTimeHHmm: dayjs().format('YYYY-MM-DD HH:mm'),
        currentEpisode: 0,
        totalEpisode: 0,
        status: EStatus.ONGOING,
        cover: '-',
        firstEpisodeDateTimeYYYYMMDDHHmm: dayjs().format('YYYY-MM-DD HH:mm'),
    }

    const { mutate: addAnimeMution } = useMutation({
        mutationFn: addAnime,
        onSuccess: () => {
            queryClient.invalidateQueries({
                queryKey: ['my-anime'],
            })
            queryClient.invalidateQueries({
                queryKey: ['schedule'],
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
            addAnimeMution({
                cover,
                name,
                status,
                totalEpisode,
                updateTimeHHmm: HHmm,
                firstEpisodeDateTime: firstEpisodeDateTimeTimestamp,
            })
        } else {
            const { currentEpisode, updateWeekday } = data
            addAnimeMution({
                cover,
                currentEpisode,
                name,
                status,
                totalEpisode,
                updateTimeHHmm: HHmm,
                updateWeekday,
            })
        }
    }

    return <BaseAnimeForm formData={initialFormData} onSubmit={onSubmit} />
}

export default EditAnime
