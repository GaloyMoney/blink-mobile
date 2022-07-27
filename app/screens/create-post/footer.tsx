import * as React from "react"
// eslint-disable-next-line react-native/split-platform-components
import { Dimensions, StyleSheet, Text, TouchableOpacity, ViewStyle } from "react-native"
import { Row } from "@app/components/row"
import { eng } from "@app/constants/en"
import { fontSize, typography } from "@app/theme"
const { width, height } = Dimensions.get('window')
const IMAGE_WIDTH = width - 32 * 2
const IMAGE_HEIGHT = IMAGE_WIDTH * 0.635
interface Props {
    onPress: () => void
    style: ViewStyle
}
export const FooterCreatePost: React.FC<Props> = ({ onPress, style }) => {
    return (
        <Row containerStyle={{ justifyContent: 'space-between', width: '100%', ...style}}>
            <TouchableOpacity style={styles.button}
                onPress={onPress}
            >
                <Text style={[styles.text]}>{eng.skip}</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.button}
                onPress={onPress}
            >
                <Text style={[styles.text]}>{eng.next}</Text>
            </TouchableOpacity>
        </Row>
    )
}

const styles = StyleSheet.create({
    button: {
      borderRadius: 20, paddingHorizontal: 25,
      paddingVertical: 7, backgroundColor: '#3653FE',
      justifyContent: 'center', alignItems: 'center',
    },
    text: {
      fontFamily: typography.medium, fontSize: fontSize.font16,
      color: 'white'
    },
})