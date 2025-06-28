import { FormInput, useZodForm } from '@/components/Form'
import React from 'react'
import { Alert, Button, View } from 'react-native'
import { z } from 'zod'

const schema = z.object({
    username: z.string().min(3, '用户名至少3位'),
    password: z.string().min(6, '密码至少6位'),
})

type FormValues = z.infer<typeof schema>

export default function LoginScreen() {
    const {
        control,
        handleSubmit,
        formState: { errors },
    } = useZodForm<FormValues>(schema)

    const onSubmit = (data: FormValues) => {
        Alert.alert('表单通过', JSON.stringify(data, null, 2))
    }

    return (
        <View style={{ padding: 20 }}>
            <FormInput
                name="username"
                control={control}
                label="用户名"
                placeholder="请输入用户名"
                error={errors.username?.message as string}
                inputHeight={44}
            />
            <FormInput
                name="password"
                control={control}
                label="密码"
                placeholder="请输入密码"
                error={errors.password?.message as string}
                secureTextEntry
                inputHeight={44}
            />
            <Button title="提交" onPress={handleSubmit(onSubmit)} />
        </View>
    )
}
