import React, { Fragment } from 'react'
import { StyleSheet, Text, View } from 'react-native'

interface IProps {
    title: string
    actions?: React.ReactNode[]
}

function PageHeader({ title, actions }: IProps) {
    return (
        <View style={styles.header}>
            <Text style={styles.headerTitle}>{title}</Text>
            {actions &&
                actions.map((item, index) => {
                    return <Fragment key={index}>{item}</Fragment>
                })}
        </View>
    )
}

export default PageHeader

const styles = StyleSheet.create({
    header: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        paddingHorizontal: 10,
        alignItems: 'center',
        height: 60,
    },
    headerTitle: {
        fontSize: 20,
        fontWeight: 'bold',
    },
})
