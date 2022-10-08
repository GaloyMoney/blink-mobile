import * as React from "react"
import { StyleProp, Text, TouchableOpacity, View, ViewStyle } from "react-native"
import EStyleSheet from "react-native-extended-stylesheet"

import BackSvg from "@asset/svgs/back-button.svg"
import { useNavigation } from "@react-navigation/native"
import { fontSize, palette, typography } from "@app/theme"
import { Row } from "@app/components/row"
import XSvg from '@asset/svgs/x.svg'
const styles = EStyleSheet.create({})

export interface TagProps {
    style?: StyleProp<ViewStyle> 
    onClear?:()=>void
    title: string
    onPress?:()=>void
    disabled?: boolean
}

export const TagComponent: React.FC<TagProps> = ({
    style, 
    title,
    onClear,
    disabled,
    onPress
}: TagProps) => {
    const navigation = useNavigation()
    return (
        <TouchableOpacity
            activeOpacity={1}
            disabled={disabled}
            onPress={() => onPress && onPress()}
        >
            <Row
                containerStyle={[{ paddingVertical: 3, paddingHorizontal: 7, borderRadius: 12, backgroundColor: palette.lightOrange },style]}
                hc
            >
                <Text style={{ color: 'white' }}>{title}</Text>
                {onClear?<TouchableOpacity
                    onPress={() => onClear && onClear()}
                    hitSlop={{ right: 5, left: 5, bottom: 5, top: 5 }}
                >
                    <XSvg height={15} />
                </TouchableOpacity> : null}
            </Row>
        </TouchableOpacity>
    )
}
