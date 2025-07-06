import Feather from '@expo/vector-icons/Feather'
import { useMemo, useState } from 'react'
import { StyleSheet, Text, View } from 'react-native'
import Calendar, { CalendarComponents, CalendarDay, CalendarWeek, DateType } from 'react-native-ui-datepicker'

const components: CalendarComponents = {
    IconPrev: <Feather name="chevron-left" size={22} color="#888" />,
    IconNext: <Feather name="chevron-right" size={22} color="#888" />,
    Weekday: (weekday: CalendarWeek) => <Weekday weekday={weekday} />,
    Day: (day: CalendarDay) => <Day day={day} />,
}

export default function CustomDatePicker3() {
    const [date, setDate] = useState<DateType>()

    return (
        <Calendar
            mode="single"
            date={date}
            onChange={({ date }) => setDate(date)}
            containerHeight={400}
            weekdaysHeight={44}
            firstDayOfWeek={1}
            monthCaptionFormat="short"
            multiRangeMode
            className="w-full border-none bg-transparent px-0 pb-2 pt-0 shadow-none"
            classNames={{
                day_cell: 'p-1',
                header: 'px-[65px] mb-2',
                weekdays: 'py-2 mx-1 bg-blue-500/10 rounded dark:bg-slate-800',
                month_selector_label: 'font-archivoMedium text-muted-foreground text-lg',
                year_selector_label: 'font-archivoMedium text-muted-foreground text-lg',
                month: 'rounded web:hover:bg-muted web:dark:hover:bg-slate-700/60',
                month_label: 'font-archivo text-lg text-foreground',
                selected_month: 'bg-slate-500 web:hover:bg-slate-500',
                selected_month_label: 'text-slate-100',
                year: 'rounded web:hover:bg-muted web:dark:hover:bg-slate-700/60',
                year_label: 'font-archivo text-lg text-foreground',
                active_year: 'bg-slate-700/60',
                selected_year: 'bg-slate-500 web:hover:bg-slate-500',
                selected_year_label: 'text-slate-100',
            }}
            components={components}
        />
    )
}

function Weekday({ weekday }: { weekday: CalendarWeek }) {
    return <Text style={styles.weekdayText}>{weekday.name.min[0]}</Text>
}

function Day({ day }: { day: CalendarDay }) {
    const { isSelected, isToday, isCurrentMonth } = day
    const length = day.number % 3 === 0 ? 1 : day.number % 4 === 2 ? 2 : day.number % 5 === 0 ? 3 : 0

    const dots = useMemo(() => <Dots length={length} />, [length])
    console.log(day.date)

    return (
        <View style={[styles.dayContainer, isSelected && styles.daySelected]}>
            <Text
                style={[
                    styles.dayText,
                    !isCurrentMonth && styles.dayNotCurrentMonth,
                    isSelected && styles.dayTextSelected,
                ]}
            >
                {day.text}
            </Text>
            <Text style={{ fontSize: 6 }}>第一集</Text>
        </View>
    )
}

function Dots({ length }: { length: number }) {
    const shuffledColors = shuffleArray(colors)

    return (
        <View style={styles.dotsRow}>
            {Array.from({ length }, (_, index) => (
                <View key={index} style={[styles.dot, { backgroundColor: shuffledColors[index] }]} />
            ))}
        </View>
    )
}

const shuffleArray = (array: string[]) => {
    const copy = [...array]
    for (let i = copy.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1))
        ;[copy[i], copy[j]] = [copy[j], copy[i]]
    }
    return copy
}

const colors = ['green', 'red', 'orange']

const styles = StyleSheet.create({
    weekdayText: {
        fontSize: 14,
        fontWeight: '500',
        color: '#444',
    },
    dayContainer: {
        flex: 1,
        alignItems: 'center',
        justifyContent: 'center',
        borderRadius: 6,
        paddingBottom: 6,
        borderWidth: 1,
        borderColor: 'transparent',
    },
    daySelected: {
        backgroundColor: '#ffe4e6',
        borderColor: '#f472b6',
        width: 50,
    },
    dayText: {
        fontSize: 14,
        color: '#000',
    },
    dayTextSelected: {
        color: '#1e293b',
    },
    dayNotCurrentMonth: {
        opacity: 0.3,
    },
    dotsRow: {
        flexDirection: 'row',
        gap: 3,
        position: 'absolute',
        bottom: 4,
    },
    dot: {
        width: 6,
        height: 6,
        borderRadius: 3,
    },
})
