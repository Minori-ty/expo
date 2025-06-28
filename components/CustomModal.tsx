import React, { PropsWithChildren } from 'react'
import { Modal, Pressable, StyleSheet } from 'react-native'

interface ICustomModalProps {
    visible: boolean
    onClose: () => void
}

function CustomModal({ visible, children, onClose }: PropsWithChildren<ICustomModalProps>) {
    return (
        <Modal transparent visible={visible} animationType="fade" onRequestClose={onClose}>
            <Pressable style={styles.overlay} onPress={onClose}>
                {/* 下面这个View包裹内容，阻止事件冒泡 */}
                <Pressable style={styles.content} onPress={() => {}}>
                    {children}
                </Pressable>
            </Pressable>
        </Modal>
    )
}

const styles = StyleSheet.create({
    overlay: {
        flex: 1,
        backgroundColor: 'rgba(0,0,0,0.4)',
        justifyContent: 'center',
        alignItems: 'center',
    },
    content: {
        backgroundColor: '#fff',
        paddingHorizontal: 20,
        paddingTop: 30,
        paddingBottom: 40,
        width: 300,
        borderRadius: 25,
        elevation: 4,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.2,
        shadowRadius: 8,
    },
})

export default CustomModal
