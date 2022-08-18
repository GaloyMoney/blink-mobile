import * as React from "react"
import { StyleProp, Text, TouchableOpacity, View, ViewStyle } from "react-native"
import EStyleSheet from "react-native-extended-stylesheet"
import { Row } from "../row"

import BackSvg from "@asset/svgs/back-button.svg"
import { useNavigation } from "@react-navigation/native"
import { fontSize, typography } from "@app/theme"
const styles = EStyleSheet.create({})

export interface HeaderProps {
  style?: StyleProp<ViewStyle>
  rightComponent?: React.ReactNode
  title?: string
}

export const HeaderComponent: React.FC<HeaderProps> = ({
  style,
  rightComponent,
  title,
}: HeaderProps) => {
  const navigation = useNavigation()
  return (
    <Row containerStyle={[{ width: "100%", justifyContent: "space-between" }, style]}>
      <TouchableOpacity
        hitSlop={{ bottom: 5, left: 5, top: 5, right: 5 }}
        onPress={() => {
          if (navigation.canGoBack()) {
            navigation.goBack()
          }
        }}
      >
        <BackSvg />
        <Text style={{ fontFamily: typography.regular, fontSize: fontSize.font20 }}>
          {title}
        </Text>
      </TouchableOpacity>
      {rightComponent ? rightComponent : <View />}
    </Row>
  )
}
