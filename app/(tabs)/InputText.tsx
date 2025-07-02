import CustomModal from '@/components/CustomModal'
import React, { useState } from 'react'
import { StyleSheet, TextInputProps, TextInput as TextInputRN, View } from 'react-native'
import { KeyboardAwareScrollView } from 'react-native-keyboard-controller'
import DateTimePicker, { DateType, useDefaultStyles } from 'react-native-ui-datepicker'

function TextInput(props: TextInputProps) {
    return (
        <TextInputRN
            placeholderTextColor="#6c6c6c"
            style={styles.textInput}
            multiline
            numberOfLines={2}
            testID={props.placeholder}
            {...props}
            placeholder={`${props.placeholder} (${props.keyboardType === 'default' ? 'text' : 'numeric'})`}
        />
    )
}

export default function AwareScrollView() {
    const defaultStyles = useDefaultStyles()
    const [selected, setSelected] = useState<DateType>()
    return (
        <KeyboardAwareScrollView
            bottomOffset={0}
            style={styles.container}
            contentContainerStyle={styles.content}
            showsVerticalScrollIndicator={false}
            keyboardShouldPersistTaps="handled"
        >
            <CustomModal visible={true} onClose={() => {}}>
                <View style={styles.panel}>
                    <DateTimePicker
                        mode="single"
                        date={selected}
                        onChange={({ date }) => setSelected(date)}
                        styles={defaultStyles}
                        timePicker={true}
                    />
                </View>
            </CustomModal>
        </KeyboardAwareScrollView>
    )
}

const styles = StyleSheet.create({
    container: {
        paddingHorizontal: 16,
    },
    content: {
        paddingTop: 50,
    },
    textInput: {
        width: '100%',
        minHeight: 50,
        maxHeight: 200,
        // marginBottom: 50,
        borderColor: 'black',
        borderWidth: 2,
        marginRight: 160,
        borderRadius: 10,
        color: 'black',
        paddingHorizontal: 12,
    },
    panel: {
        width: 300,
        height: 350,
        backgroundColor: 'white',
        paddingTop: 10,
        paddingHorizontal: 10,
        borderRadius: 10,
    },
})
