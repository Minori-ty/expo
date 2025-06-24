import Notification from '@/utils/Notification'
import * as React from 'react'
import { Dimensions, StyleSheet, Text, View } from 'react-native'
import { SafeAreaView } from 'react-native-safe-area-context'
import { SceneMap, TabBar, TabView } from 'react-native-tab-view'

const FirstRoute = () => (
    <View style={[styles.scene, { backgroundColor: '#ff4081' }]}>
        <Text>第一个 Tab 内容</Text>
    </View>
)

const SecondRoute = () => (
    <View style={[styles.scene, { backgroundColor: '#673ab7' }]}>
        <Text>第二个 Tab 内容</Text>
    </View>
)

export default function MyTabs() {
    const [index, setIndex] = React.useState(0)
    const [routes] = React.useState([
        { key: 'first', title: '周一' },
        { key: 'second', title: '周二' },
        { key: 'third', title: '周三' },
        { key: 'third4', title: '周四' },
        { key: 'third5', title: '周五' },
        { key: 'third6', title: '周六' },
        { key: 'third7', title: '周日' },
    ])

    const renderScene = SceneMap({
        first: Notification,
        second: SecondRoute,
        third: FirstRoute,
        third4: SecondRoute,
        third5: FirstRoute,
        third6: SecondRoute,
        third7: FirstRoute,
    })

    return (
        <SafeAreaView style={{ flex: 1 }} edges={['top']}>
            <TabView
                navigationState={{ index, routes }}
                renderScene={renderScene}
                onIndexChange={setIndex}
                initialLayout={{ width: Dimensions.get('window').width }}
                renderTabBar={(props) => (
                    <TabBar
                        {...props}
                        scrollEnabled
                        tabStyle={{ width: 80, backgroundColor: '#eee' }}
                        activeColor="#000"
                        inactiveColor="#888"
                    />
                )}
            ></TabView>
        </SafeAreaView>
    )
}

const styles = StyleSheet.create({
    scene: {
        flex: 1,
        alignItems: 'center',
        justifyContent: 'center',
    },
})
