import * as React from "react"
// eslint-disable-next-line react-native/split-platform-components
import { Dimensions, StyleSheet, Text, TextInput, View, ViewStyle } from "react-native"
import { fontSize, typography } from "@app/theme"
import { Row } from "../row";
const { width, height } = Dimensions.get('window')
interface TextInputProps {
    onChangeText?: ((text: string) => void) | undefined;
    value?: string
    placeHolder: string
    title: string
    textField?: boolean
    disabled?: boolean
    containerStyle?: ViewStyle
    rightComponent?: React.ReactNode
}
export const CustomTextInput: React.FC<TextInputProps> = ({
    onChangeText, placeHolder, title, textField, 
    value, disabled, containerStyle, rightComponent
}) => {
    return <View style={[{ width: '100%' }, containerStyle]}>
        <Text style={styles.labelStyle}>{title}</Text>
        <Row >
            <TextInput
                onChangeText={onChangeText}
                style={[ styles.textInputStyle, textField ? { height: 120 } : {}]}
                multiline={textField}
                placeholder={placeHolder}
                placeholderTextColor={'#C0C0C0'}
                value={value}
                editable={!disabled}
            />
            {rightComponent ? rightComponent : null}
        </Row>
    </View>
}
const styles = StyleSheet.create({
    textInputStyle: {
        borderWidth: 1, borderColor: '#EBEBEB', paddingVertical: 10,
        paddingHorizontal: 15, fontFamily: typography.regular,
        fontSize: fontSize.font16, borderRadius: 4, flex: 1,textAlignVertical:'top'
    },
    labelStyle: { fontFamily: typography.regular, fontSize: fontSize.font16, marginVertical: 10 },
})