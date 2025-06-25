import PageHeader from '@/components/PageHeader'
import { IconSymbol } from '@/components/ui/IconSymbol'
import { useRouter } from 'expo-router'
import React from 'react'
import { TouchableOpacity } from 'react-native'
import { SafeAreaView } from 'react-native-safe-area-context'

const schedule = () => {
    const router = useRouter()
    return (
        <SafeAreaView>
            <PageHeader
                title="动漫追番"
                actions={[
                    <TouchableOpacity onPress={() => router.push('/addAnime')}>
                        <IconSymbol size={35} name="plus.app.fill" color="black" />
                    </TouchableOpacity>,
                ]}
            />
        </SafeAreaView>
    )
}

export default schedule
