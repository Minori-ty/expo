import { addAnime } from '@/api/anime'
import { RadioGroup } from '@/components/RadioGroup'
import { insertAnimeSchema } from '@/db/schema'
import { queryClient } from '@/utils/react-query'
import { zodResolver } from '@hookform/resolvers/zod'
import { Picker } from '@react-native-picker/picker'
import { useMutation } from '@tanstack/react-query'
import { router, useNavigation } from 'expo-router'
import React, { useEffect, useState } from 'react'
import { Controller, SubmitHandler, useForm } from 'react-hook-form'
import {
    Button,
    Keyboard,
    KeyboardAvoidingView,
    Platform,
    ScrollView,
    StyleSheet,
    Text,
    TextInput,
    View,
} from 'react-native'
import { z, ZodIssueCode } from 'zod'
import { z as zv4 } from 'zod/v4'

const insertAnimeData = insertAnimeSchema
    .omit({ id: true, createdAt: true, isFinished: true, firstEpisodeDateTime: true, lastEpisodeDateTime: true })
    .extend({})
export type TFormData = zv4.infer<typeof insertAnimeData>

// 表单验证规则
const animeSchema = z
    .object({
        name: z.string().min(1, '请输入番剧名称'),
        updateWeekday: z.coerce.number().min(1, '请选择更新周').max(7, '更新周必须在1-7之间'),
        updateTimeHHmm: z.string().regex(/(0[0-9]|1[0-9]|2[0-3]):[0-5][0-9]/, '请输入正确的时间格式HH:mm'),
        currentEpisode: z.coerce.number().min(1, '当前集数至少为1'),
        totalEpisode: z.coerce.number().min(1, '总集数至少为1'),
        cover: z.string().url('请输入有效的URL'),
    })
    .superRefine((values, ctx) => {
        if (values.totalEpisode < values.currentEpisode) {
            ctx.addIssue({
                code: ZodIssueCode.custom,
                path: ['totalEpisode'],
                message: '总集数不能小于当前集数',
            })
        }
    })

type AnimeFormData = z.infer<typeof animeSchema>

function AnimeForm() {
    const navigation = useNavigation()
    useEffect(() => {
        navigation.setOptions({
            headerTitle: '添加动漫',
            headerTitleAlign: 'center',
        })
    }, [navigation])
    const {
        control,
        handleSubmit,
        formState: { errors },
        reset,
    } = useForm<AnimeFormData>({
        resolver: zodResolver(animeSchema),
        defaultValues: {
            name: '',
            updateWeekday: 1,
            updateTimeHHmm: '',
            currentEpisode: 1,
            totalEpisode: 13,
            cover: '',
        },
    })
    const [selected, setSelected] = useState(2)
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
    })

    const onSubmit: SubmitHandler<AnimeFormData> = async (data) => {
        console.log('提交表单数据:', data)
        addAnimeMution(data)
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

    // 处理键盘事件
    const [keyboardHeight, setKeyboardHeight] = useState(0)

    useEffect(() => {
        const keyboardDidShowListener = Keyboard.addListener('keyboardDidShow', (e) => {
            setKeyboardHeight(e.endCoordinates.height - 150)
        })
        const keyboardDidHideListener = Keyboard.addListener('keyboardDidHide', () => {
            setKeyboardHeight(0)
        })

        return () => {
            keyboardDidShowListener.remove()
            keyboardDidHideListener.remove()
        }
    }, [])

    const options = [
        { label: '已完结', value: 1 },
        { label: '连载中', value: 2 },
        { label: '即将更新', value: 3 },
    ]
    return (
        <KeyboardAvoidingView style={[styles.container]} behavior={Platform.OS === 'ios' ? 'padding' : 'height'}>
            <ScrollView keyboardShouldPersistTaps="handled" style={[styles.scrollView]}>
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
                    {errors.name && <Text style={styles.errorText}>{errors.name.message}</Text>}
                </View>
                <View style={styles.formGroup}>
                    <Text style={styles.label}>更新状态</Text>
                    <RadioGroup
                        options={options}
                        value={selected}
                        onChange={setSelected}
                        style={{ justifyContent: 'center' }}
                    />
                </View>
                {selected !== 2 && (
                    <View style={styles.formGroup}>
                        <Text style={styles.label}>首播时间</Text>
                        <Controller
                            control={control}
                            name="updateTimeHHmm"
                            render={({ field }) => (
                                <TextInput
                                    {...field}
                                    style={[styles.input, errors.updateTimeHHmm && styles.errorInput]}
                                    placeholder="例如: 2024-05-15"
                                    keyboardType="numeric"
                                    onChangeText={field.onChange}
                                    value={field.value}
                                />
                            )}
                        />
                        {errors.updateTimeHHmm && <Text style={styles.errorText}>{errors.updateTimeHHmm.message}</Text>}
                    </View>
                )}
                {selected === 2 && (
                    <View style={styles.formGroup}>
                        <Text style={styles.label}>更新周</Text>
                        <Controller
                            control={control}
                            name="updateWeekday"
                            render={({ field }) => (
                                <Picker
                                    {...field}
                                    selectedValue={field.value}
                                    style={[styles.picker, errors.updateWeekday && styles.errorInput]}
                                    onValueChange={field.onChange}
                                >
                                    {weekdays.map((day) => (
                                        <Picker.Item label={day.label} value={day.value} key={day.value} />
                                    ))}
                                </Picker>
                            )}
                        />
                        {errors.updateWeekday && <Text style={styles.errorText}>{errors.updateWeekday.message}</Text>}
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
                    {errors.updateTimeHHmm && <Text style={styles.errorText}>{errors.updateTimeHHmm.message}</Text>}
                </View>
                {selected === 2 && (
                    <View style={styles.formGroup}>
                        <Text style={styles.label}>当前更新集数</Text>
                        <Controller
                            control={control}
                            name="currentEpisode"
                            render={({ field }) => (
                                <TextInput
                                    {...field}
                                    style={[styles.input, errors.currentEpisode && styles.errorInput]}
                                    placeholder="请输入当前更新集数"
                                    keyboardType="numeric"
                                    onChangeText={(text) => field.onChange(parseInt(text) || 0)}
                                    value={field.value?.toString() || ''}
                                />
                            )}
                        />
                        {errors.currentEpisode && <Text style={styles.errorText}>{errors.currentEpisode.message}</Text>}
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
                    {errors.totalEpisode && <Text style={styles.errorText}>{errors.totalEpisode.message}</Text>}
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
                    {errors.cover && <Text style={styles.errorText}>{errors.cover.message}</Text>}
                </View>
                <Button title="提交" onPress={handleSubmit(onSubmit)} />
                <View style={{ height: keyboardHeight }}></View>
            </ScrollView>
        </KeyboardAvoidingView>
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
        alignItems: 'center',
        fontSize: 16,
        height: 40, // 固定高度
        justifyContent: 'center',
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
})

export default AnimeForm
