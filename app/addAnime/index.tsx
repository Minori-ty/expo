import { zodResolver } from '@hookform/resolvers/zod'
import React from 'react'
import { useForm } from 'react-hook-form'
import { Button, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native'
import { z } from 'zod'

const weekDays = [
    { label: '周一', value: 'Monday' },
    { label: '周二', value: 'Tuesday' },
    { label: '周三', value: 'Wednesday' },
    { label: '周四', value: 'Thursday' },
    { label: '周五', value: 'Friday' },
    { label: '周六', value: 'Saturday' },
    { label: '周日', value: 'Sunday' },
]

const schema = z.object({
    name: z.string().min(1, '请输入番剧名称'),
    weekDay: z.enum(['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'], {
        required_error: '请选择更新周',
    }),
    updateTime: z.string().regex(/^([01]\d|2[0-3]):([0-5]\d)$/, '时间格式为HH:mm'),
    currentEp: z.coerce.number().int().min(0, '必须为非负整数'),
    totalEp: z.coerce.number().int().min(1, '必须为正整数'),
    coverUrl: z.string().url('请输入合法的URL'),
})

type FormData = z.infer<typeof schema>

export default function BangumiForm() {
    const {
        register,
        setValue,
        handleSubmit,
        watch,
        formState: { errors },
    } = useForm<FormData>({
        resolver: zodResolver(schema),
        defaultValues: {
            name: '',
            weekDay: 'Monday',
            updateTime: '',
            currentEp: 0,
            totalEp: 1,
            coverUrl: '',
        },
    })

    React.useEffect(() => {
        register('name')
        register('updateTime')
        register('currentEp')
        register('totalEp')
        register('coverUrl')
        register('weekDay')
    }, [register])

    const weekDay = watch('weekDay')

    const onSubmit = (data: FormData) => {
        alert(JSON.stringify(data, null, 2))
    }

    return (
        <View style={styles.container}>
            <Text style={styles.label}>番剧名称</Text>
            <TextInput
                style={styles.input}
                onChangeText={(text) => setValue('name', text)}
                placeholder="请输入番剧名称"
            />
            {errors.name && <Text style={styles.error}>{errors.name.message}</Text>}

            <Text style={styles.label}>更新周</Text>
            <View style={styles.row}>
                {weekDays.map((day) => (
                    <TouchableOpacity
                        key={day.value}
                        style={[styles.weekBtn, weekDay === day.value && styles.weekBtnActive]}
                        onPress={() => setValue('weekDay', day.value as z.infer<typeof schema.shape.weekDay>)}
                    >
                        <Text style={weekDay === day.value ? styles.weekBtnTextActive : styles.weekBtnText}>
                            {day.label}
                        </Text>
                    </TouchableOpacity>
                ))}
            </View>
            {errors.weekDay && <Text style={styles.error}>{errors.weekDay.message}</Text>}

            <Text style={styles.label}>更新时间点 (HH:mm)</Text>
            <TextInput
                style={styles.input}
                onChangeText={(text) => setValue('updateTime', text)}
                placeholder="例如 20:00"
            />
            {errors.updateTime && <Text style={styles.error}>{errors.updateTime.message}</Text>}

            <Text style={styles.label}>当前更新集数</Text>
            <TextInput
                style={styles.input}
                keyboardType="numeric"
                onChangeText={(text) => setValue('currentEp', Number(text))}
                placeholder="0"
            />
            {errors.currentEp && <Text style={styles.error}>{errors.currentEp.message}</Text>}

            <Text style={styles.label}>总集数</Text>
            <TextInput
                style={styles.input}
                keyboardType="numeric"
                onChangeText={(text) => setValue('totalEp', Number(text))}
                placeholder="1"
            />
            {errors.totalEp && <Text style={styles.error}>{errors.totalEp.message}</Text>}

            <Text style={styles.label}>封面URL</Text>
            <TextInput
                style={styles.input}
                onChangeText={(text) => setValue('coverUrl', text)}
                placeholder="请输入图片链接"
            />
            {errors.coverUrl && <Text style={styles.error}>{errors.coverUrl.message}</Text>}

            <Button title="提交" onPress={handleSubmit(onSubmit)} />
        </View>
    )
}

const styles = StyleSheet.create({
    container: { padding: 20 },
    label: { marginTop: 10 },
    input: {
        borderWidth: 1,
        borderColor: '#ccc',
        borderRadius: 4,
        // padding: 8,
        // marginTop: 4,
    },
    row: { flexDirection: 'row', flexWrap: 'wrap', marginVertical: 8 },
    weekBtn: {
        borderWidth: 1,
        borderColor: '#888',
        borderRadius: 16,
        paddingHorizontal: 12,
        paddingVertical: 6,
        marginRight: 8,
        marginBottom: 8,
        backgroundColor: '#fff',
    },
    weekBtnActive: {
        backgroundColor: '#007AFF',
        borderColor: '#007AFF',
    },
    weekBtnText: { color: '#333' },
    weekBtnTextActive: { color: '#fff' },
    error: { color: 'red', fontSize: 12 },
})
