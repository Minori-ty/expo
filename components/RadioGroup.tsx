import React from 'react'
import { StyleSheet, Text, TextStyle, TouchableOpacity, View, ViewStyle } from 'react-native'

/**
 * 单个 RadioItem 的属性
 */
export interface RadioItemProps<T extends string | number> {
    label: string
    value: T
    selected: boolean
    onPress: (value: T) => void
    size?: number
    color?: string
    labelStyle?: TextStyle
}

export function RadioItem<T extends string | number>(props: RadioItemProps<T>) {
    const { label, value, selected, onPress, size = 20, color = '#fb7299', labelStyle } = props
    return (
        <TouchableOpacity
            style={styles.container}
            onPress={() => onPress(value)}
            activeOpacity={0.7}
            accessibilityRole="radio"
            accessibilityState={{ selected }}
        >
            <View
                style={[
                    styles.radio,
                    {
                        borderColor: color,
                        width: size,
                        height: size,
                        borderRadius: size / 2,
                    },
                ]}
            >
                {selected ? (
                    <View
                        style={[
                            styles.dot,
                            {
                                backgroundColor: color,
                                width: size / 2,
                                height: size / 2,
                                borderRadius: size / 4,
                            },
                        ]}
                    />
                ) : null}
            </View>
            <Text style={[styles.label, labelStyle]}>{label}</Text>
        </TouchableOpacity>
    )
}

/**
 * RadioGroup 的选项类型
 */
export interface RadioOption<T extends string | number> {
    label: string
    value: T
}
/**
 * RadioGroup 组件的属性
 */
export interface RadioGroupProps<T extends string | number> {
    options: RadioOption<T>[]
    value: T
    onChange: (value: T) => void
    size?: number
    color?: string
    labelStyle?: TextStyle
    style?: ViewStyle
}

/**
 * RadioGroup 单选组组件
 * 支持 options 自动类型推断
 */
export function RadioGroup<T extends string | number>(props: RadioGroupProps<T>) {
    const { options, value, onChange, size = 20, color = '#fb7299', labelStyle, style } = props
    return (
        <View style={style}>
            {options.map((opt) => (
                <RadioItem
                    key={String(opt.value)}
                    label={opt.label}
                    value={opt.value}
                    selected={value === opt.value}
                    onPress={onChange}
                    size={size}
                    color={color}
                    labelStyle={labelStyle}
                />
            ))}
        </View>
    )
}

const styles = StyleSheet.create({
    container: { flexDirection: 'row', alignItems: 'center', marginVertical: 4 },
    radio: {
        borderWidth: 2,
        justifyContent: 'center',
        alignItems: 'center',
        marginRight: 8,
    },
    dot: {},
    label: { fontSize: 16, color: '#222' },
})
