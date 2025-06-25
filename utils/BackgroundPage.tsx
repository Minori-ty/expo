import { useEffect } from 'react'
import { StyleSheet, Text, View } from 'react-native'
import { registerBackgroundFetchAsync } from './background'

function App() {
    useEffect(() => {
        // 应用启动时注册后台任务
        registerBackgroundFetchAsync()
            .then(() => console.log('Background task registered successfully'))
            .catch((error) => console.error('Failed to register background task:', error))
    }, [])

    return (
        <View style={styles.container}>
            <Text>后台任务已注册!</Text>
        </View>
    )
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#fff',
        alignItems: 'center',
        justifyContent: 'center',
    },
})

export default App
