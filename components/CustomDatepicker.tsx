import Feather from '@expo/vector-icons/Feather'
import React, { useMemo } from 'react'
import { Text, View } from 'react-native'
import DateTimePicker, { CalendarComponents, CalendarDay, CalendarWeek } from 'react-native-ui-datepicker'

const components: CalendarComponents = {
    IconPrev: <Feather name="chevron-left" size={22} />,
    IconNext: <Feather name="chevron-right" size={22} />,
    Weekday: (weekday: CalendarWeek) => <Weekday weekday={weekday} />,
    Day: (day: CalendarDay) => <Day day={day} />,
}

export default function CustomDatepicker() {
    return <DateTimePicker mode="single" components={components} locale="zh" />
}

type WeekdayProps = {
    weekday: CalendarWeek
}

function Weekday({ weekday }: WeekdayProps) {
    return <Text>{weekday.name.min[0]}</Text>
}

type DayProps = {
    day: CalendarDay
}

function Day({ day }: DayProps) {
    const { isSelected, isToday, isCurrentMonth } = day
    const length = day.number % 3 === 0 ? 1 : day.number % 4 === 2 ? 2 : day.number % 5 === 0 ? 3 : 0

    const dots = useMemo(() => <Dots length={length} />, [length])

    return (
        <View>
            <Text>{day.text}</Text>
            {dots}
        </View>
    )
}

const colors = ['bg-green-500', 'bg-red-500', 'bg-yellow-500']

function Dots({ length }: { length: number }) {
    const shuffledColors = shuffleArray(colors)

    return (
        <View>
            {Array.from({ length }, (_, index) => (
                <View key={index} style={{ width: 10, borderRadius: 10, backgroundColor: 'red' }} />
            ))}
        </View>
    )
}

function shuffleArray(array: string[]) {
    for (let i = array.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1))
        ;[array[i], array[j]] = [array[j], array[i]]
    }
    return array
}
