import React from 'react'
import { StyleSheet, TextInputProps, TextInput as TextInputRN } from 'react-native'
import { KeyboardAwareScrollView } from 'react-native-keyboard-controller'

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
    return (
        <KeyboardAwareScrollView bottomOffset={50} style={styles.container} contentContainerStyle={styles.content}>
            {new Array(20).fill(0).map((_, i) => (
                <TextInput key={i} placeholder={`TextInput#${i}`} keyboardType={i % 2 === 0 ? 'numeric' : 'default'} />
            ))}
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
})
