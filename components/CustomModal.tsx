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
                <Pressable onPress={() => {}}>{children}</Pressable>
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
})

export default CustomModal
