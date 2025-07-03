import { addAnime } from '@/api'
import { RadioGroup } from '@/components/RadioGroup'
import { EStatus, EUpdateWeekday, insertAnimeSchema } from '@/db/schema'
import { queryClient } from '@/utils/react-query'
import { zodResolver } from '@hookform/resolvers/zod'
import { Picker } from '@react-native-picker/picker'
import { useMutation } from '@tanstack/react-query'
import dayjs from 'dayjs'
import { router, useNavigation } from 'expo-router'
import React, { useEffect, useState } from 'react'
import { Controller, FieldErrors, useForm } from 'react-hook-form'
import { Button, Platform, StyleSheet, Text, TextInput, View } from 'react-native'
import { KeyboardAwareScrollView } from 'react-native-keyboard-controller'
import { z, ZodIssueCode, ZodTypeAny } from 'zod'

export const insertAnimeData = insertAnimeSchema
    .omit({ id: true, createdAt: true, lastEpisodeDateTime: true, firstEpisodeDateTime: true })
    .extend({ firstEpisodeDateTime: z.string() })

const baseScheme = z.object({
    name: z.string().min(1, '请输入番剧名称').max(20, '番剧名称长度不能超过20个字符'),
    status: z.union([z.literal(EStatus.COMING_SOON), z.literal(EStatus.COMPLETED), z.literal(EStatus.ONGOING)]),
    updateTimeHHmm: z.string().regex(/(0[0-9]|1[0-9]|2[0-3]):[0-5][0-9]/, '请输入正确的时间格式HH:mm'),
    totalEpisode: z.coerce.number().min(1, '总集数至少为1'),
    cover: z.string().url('请输入有效的URL'),
})

function createSchema(status: EStatus): ZodTypeAny {
    let dynamicFields: z.ZodRawShape = {}
    if (status === EStatus.ONGOING) {
        dynamicFields = {
            updateWeekday: z.coerce.number().int().min(1, '请选择更新周').max(7, '更新周必须在1-7之间'),
            currentEpisode: z.coerce.number().min(1, '当前集数至少为1'),
        }
        return baseScheme.extend(dynamicFields).superRefine((val, ctx) => {
            if (val.currentEpisode > val.totalEpisode) {
                ctx.addIssue({
                    code: ZodIssueCode.custom,
                    path: ['currentEpisode'],
                    message: '当前集数不能大于总集数',
                })
            }
        })
    } else if (status === EStatus.COMPLETED) {
        dynamicFields = {
            firstEpisodeDateTime: z.string(),
        }
        return baseScheme.extend(dynamicFields).superRefine((val, ctx) => {
            const { updateTimeHHmm, totalEpisode, firstEpisodeDateTime } = val
            const lastEpisodeDateTimeTimestamp = dayjs(`${firstEpisodeDateTime} ${updateTimeHHmm}`)
                .add((totalEpisode - 1) * 7, 'day')
                .unix()

            if (lastEpisodeDateTimeTimestamp > dayjs().unix()) {
                ctx.addIssue({
                    code: ZodIssueCode.custom,
                    path: ['firstEpisodeDateTime'],
                    message: '当前番剧还未完结，请设置正确的日期',
                })
            }
        })
    } else if (status === EStatus.COMING_SOON) {
        dynamicFields = {
            firstEpisodeDateTime: z.string(),
        }
        return baseScheme.extend(dynamicFields).superRefine((val, ctx) => {
            const { firstEpisodeDateTime, updateTimeHHmm } = val
            const firstEpisodeDateTimeTimestamp = dayjs(`${firstEpisodeDateTime} ${updateTimeHHmm}`).unix()

            if (firstEpisodeDateTimeTimestamp < dayjs().unix()) {
                ctx.addIssue({
                    code: ZodIssueCode.custom,
                    path: ['firstEpisodeDateTime'],
                    message: '当前番剧已开播，请设置正确的日期',
                })
            }
        })
    }
    return baseScheme
}

interface IBaseFormData {
    name: string
    status: EStatus
    updateTimeHHmm: string
    totalEpisode: number
    cover: string
}

type TOngoingForm = IBaseFormData & {
    updateWeekday: number
    currentEpisode: number
}

type ICompleteForm = IBaseFormData & {
    firstEpisodeDateTime: string
}

export type TFormData = z.infer<ReturnType<typeof createSchema>>
function AnimeForm() {
    const navigation = useNavigation()
    useEffect(() => {
        navigation.setOptions({
            headerTitle: '添加动漫',
            headerTitleAlign: 'center',
        })
    }, [navigation])
    const [status, setStatus] = useState(EStatus.ONGOING)
    const formSchema = createSchema(status)
    const {
        control,
        handleSubmit,
        formState: { errors },
        reset,
    } = useForm<TOngoingForm | ICompleteForm>({
        resolver: zodResolver(formSchema),
        defaultValues: {
            name: '章鱼哔的原罪',
            updateWeekday: EUpdateWeekday.MONDAY,
            updateTimeHHmm: '09:00',
            currentEpisode: 1,
            totalEpisode: 13,
            cover: 'http://lz.sinaimg.cn/large/8a65eec0gy1i295k5s0evj207i0al424.jpg',
            status: EStatus.ONGOING,
            firstEpisodeDateTime: '2025-07-08',
        },
    })

    const { mutate: addAnimeMution } = useMutation({
        mutationFn: addAnime,
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
            reset()
            router.back()
        },
        onError: (err) => {
            alert(err)
        },
    })

    function hasFirstEpisodeDateTime(data: TOngoingForm | ICompleteForm): data is ICompleteForm {
        return 'firstEpisodeDateTime' in data
    }

    const onSubmit = async (data: TOngoingForm | ICompleteForm) => {
        const { cover, name, status, totalEpisode, updateTimeHHmm } = data
        if (hasFirstEpisodeDateTime(data)) {
            const { firstEpisodeDateTime } = data
            const firstEpisodeDateTimeTimestamp = dayjs(`${firstEpisodeDateTime} ${updateTimeHHmm}`).unix()
            addAnimeMution({
                cover,
                name,
                status,
                totalEpisode,
                updateTimeHHmm,
                firstEpisodeDateTime: firstEpisodeDateTimeTimestamp,
            })
        } else {
            const { currentEpisode, updateWeekday } = data
            addAnimeMution({ cover, currentEpisode, name, status, totalEpisode, updateTimeHHmm, updateWeekday })
        }
    }
    const weekdays = [
        { label: '周一', value: 1 },
        { label: '周二', value: 2 },
        { label: '周三', value: 3 },
        { label: '周四', value: 4 },
        { label: '周五', value: 5 },
        { label: '周六', value: 6 },
        { label: '周日', value: 7 },
    ]

    const options = [
        { label: '已完结', value: 1 },
        { label: '连载中', value: 2 },
        { label: '即将更新', value: 3 },
    ]

    function isOngoingErrors(errors: FieldErrors<TOngoingForm | ICompleteForm>): errors is FieldErrors<TOngoingForm> {
        return 'updateWeekday' in errors || 'currentEpisode' in errors
    }

    function isCompleteErrors(errors: FieldErrors<TOngoingForm | ICompleteForm>): errors is FieldErrors<ICompleteForm> {
        return 'firstEpisodeDateTime' in errors
    }
    return (
        // <KeyboardAvoidingView style={[styles.container]} behavior={Platform.OS === 'ios' ? 'padding' : 'height'}>
        //     <ScrollView keyboardShouldPersistTaps="handled" style={[styles.scrollView]}>
        <KeyboardAwareScrollView bottomOffset={50} style={styles.container} contentContainerStyle={styles.scrollView}>
            <View style={styles.formGroup}>
                <Text style={styles.label}>番剧名称</Text>
                <Controller
                    control={control}
                    name="name"
                    render={({ field }) => (
                        <TextInput
                            {...field}
                            style={[styles.input, errors.name && styles.errorInput]}
                            placeholder="请输入番剧名称"
                            onChangeText={field.onChange}
                            value={field.value}
                        />
                    )}
                />
                {errors.name && <ErrorMessage error={errors.name} />}
            </View>
            <View style={styles.formGroup}>
                <Text style={styles.label}>更新状态</Text>
                <Controller
                    control={control}
                    name="status"
                    render={({ field }) => (
                        <RadioGroup
                            {...field}
                            options={options}
                            value={field.value}
                            onChange={(val: EStatus) => {
                                field.onChange(val)
                                setStatus(val)
                            }}
                            style={styles.horizontalCenter}
                        />
                    )}
                />
            </View>
            {status !== 2 && (
                <View style={styles.formGroup}>
                    <Text style={styles.label}>首播时间</Text>
                    <Controller
                        control={control}
                        name="firstEpisodeDateTime"
                        render={({ field }) => (
                            <TextInput
                                {...field}
                                style={[
                                    styles.input,
                                    isCompleteErrors(errors) && errors.firstEpisodeDateTime && styles.errorInput,
                                ]}
                                placeholder="例如: 2025-05-15"
                                onChangeText={field.onChange}
                                value={field.value}
                            />
                        )}
                    />
                    {isCompleteErrors(errors) && errors.firstEpisodeDateTime && (
                        <ErrorMessage error={errors.firstEpisodeDateTime} />
                    )}
                </View>
            )}
            {status === 2 && (
                <View style={styles.formGroup}>
                    <Text style={styles.label}>更新周</Text>
                    <Controller
                        control={control}
                        name="updateWeekday"
                        render={({ field }) => (
                            <Picker
                                {...field}
                                selectedValue={field.value}
                                style={[
                                    styles.picker,
                                    isOngoingErrors(errors) && errors.updateWeekday && styles.errorInput,
                                ]}
                                onValueChange={field.onChange}
                            >
                                {weekdays.map((day) => (
                                    <Picker.Item label={day.label} value={day.value} key={day.value} />
                                ))}
                            </Picker>
                        )}
                    />
                    {isOngoingErrors(errors) && errors.updateWeekday && <ErrorMessage error={errors.updateWeekday} />}
                </View>
            )}
            <View style={styles.formGroup}>
                <Text style={styles.label}>更新时间(HH:mm)</Text>
                <Controller
                    control={control}
                    name="updateTimeHHmm"
                    render={({ field }) => (
                        <TextInput
                            {...field}
                            style={[styles.input, errors.updateTimeHHmm && styles.errorInput]}
                            placeholder="例如: 12:00"
                            keyboardType="numeric"
                            onChangeText={field.onChange}
                            value={field.value}
                        />
                    )}
                />
                {errors.updateTimeHHmm && <ErrorMessage error={errors.updateTimeHHmm} />}
            </View>
            {status === EStatus.ONGOING && (
                <View style={styles.formGroup}>
                    <Text style={styles.label}>当前更新集数</Text>
                    <Controller
                        control={control}
                        name="currentEpisode"
                        render={({ field }) => (
                            <TextInput
                                {...field}
                                style={[
                                    styles.input,
                                    isOngoingErrors(errors) && errors.currentEpisode && styles.errorInput,
                                ]}
                                placeholder="请输入当前更新集数"
                                keyboardType="numeric"
                                onChangeText={(text) => field.onChange(parseInt(text) || 0)}
                                value={field.value?.toString() || ''}
                            />
                        )}
                    />
                    {isOngoingErrors(errors) && errors.currentEpisode && <ErrorMessage error={errors.currentEpisode} />}
                </View>
            )}
            <View style={styles.formGroup}>
                <Text style={styles.label}>总集数</Text>
                <Controller
                    control={control}
                    name="totalEpisode"
                    render={({ field }) => (
                        <TextInput
                            {...field}
                            style={[styles.input, errors.totalEpisode && styles.errorInput]}
                            placeholder="请输入总集数"
                            keyboardType="numeric"
                            onChangeText={(text) => field.onChange(parseInt(text) || 0)}
                            value={field.value?.toString() || ''}
                        />
                    )}
                />
                {errors.totalEpisode && <ErrorMessage error={errors.totalEpisode} />}
            </View>
            <View style={styles.formGroup}>
                <Text style={styles.label}>封面URL</Text>
                <Controller
                    control={control}
                    name="cover"
                    render={({ field }) => (
                        <TextInput
                            {...field}
                            style={[styles.input, errors.cover && styles.errorInput]}
                            placeholder="请输入封面图片URL"
                            onChangeText={field.onChange}
                            value={field.value}
                        />
                    )}
                />
                {errors.cover && <ErrorMessage error={errors.cover} />}
            </View>
            <Button title="提交" onPress={handleSubmit(onSubmit)} />
        </KeyboardAwareScrollView>
        //     </ScrollView>
        // </KeyboardAvoidingView>
    )
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#fff',
    },
    scrollView: {
        flex: 1,
        padding: 16,
        paddingBottom: 50,
    },
    formGroup: {
        marginBottom: 16,
    },
    label: {
        fontSize: 16,
        marginBottom: 8,
        fontWeight: '500',
    },
    input: {
        borderWidth: 1,
        borderColor: '#ccc',
        borderRadius: 4,
        padding: 0,
        paddingLeft: 10,
        fontSize: 16,
        height: 40, // 固定高度
        textAlignVertical: 'center',
        lineHeight: 26,
        ...Platform.select({
            android: {
                paddingTop: 0,
                paddingBottom: 0,
            },
        }),
    },
    picker: {
        borderWidth: 1,
        borderColor: '#ccc',
        borderRadius: 4,
        height: 60,
    },
    errorInput: {
        borderColor: 'red',
    },
    errorText: {
        color: 'red',
        fontSize: 14,
        marginTop: 4,
    },
    horizontalCenter: {
        justifyContent: 'center',
    },
})

export default AnimeForm

function getErrorMessage(error: any): string | null {
    if (!error) return null
    if (typeof error === 'string') return error
    if (error.message) return error.message
    if (typeof error === 'object') {
        // 尝试从嵌套的错误对象中提取消息
        return getErrorMessage(Object.values(error)[0])
    }
    return null
}

// 改进 ErrorMessage 组件
function ErrorMessage({ error }: { error?: any }) {
    const message = getErrorMessage(error)
    return message ? <Text style={styles.errorText}>{message}</Text> : <></>
}
