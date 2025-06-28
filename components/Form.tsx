import { zodResolver } from '@hookform/resolvers/zod'
import React from 'react'
import { Controller, useForm } from 'react-hook-form'
import { StyleSheet, Text, TextInput, TextInputProps, View } from 'react-native'
import { z, ZodType } from 'zod/v4'

export function useZodForm<S extends ZodType<any, any, any>>(schema: S) {
    type FormData = z.infer<S>
    return useForm<FormData>({
        resolver: zodResolver(schema) as any,
    })
}

interface FormInputProps extends TextInputProps {
    name: string
    control: any
    label?: string
    rules?: any
    error?: string
    inputHeight?: number
}

export const FormInput: React.FC<FormInputProps> = ({ name, control, label, error, inputHeight = 44, ...rest }) => {
    return (
        <Controller
            control={control}
            name={name}
            render={({ field: { onChange, onBlur, value } }) => (
                <View style={styles.inputContainer}>
                    {label && <Text style={styles.label}>{label}</Text>}
                    <TextInput
                        style={[styles.input, { height: inputHeight }, error ? styles.inputError : null]}
                        onBlur={onBlur}
                        onChangeText={onChange}
                        value={value}
                        {...rest}
                    />
                    {error && <Text style={styles.errorText}>{error}</Text>}
                </View>
            )}
        />
    )
}

const styles = StyleSheet.create({
    inputContainer: { marginBottom: 16 },
    label: { marginBottom: 4, color: '#333', fontSize: 16 },
    input: {
        borderWidth: 1,
        borderColor: '#ccc',
        borderRadius: 6,
        paddingHorizontal: 12,
        backgroundColor: '#fff',
        fontSize: 16,
    },
    inputError: {
        borderColor: '#ff4d4f',
    },
    errorText: {
        marginTop: 4,
        color: '#ff4d4f',
        fontSize: 14,
    },
})
