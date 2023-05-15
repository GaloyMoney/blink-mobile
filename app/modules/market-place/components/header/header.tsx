import * as React from "react"
import { StyleProp, Text, TouchableOpacity, View, ViewStyle } from "react-native"
import BackSvg from "@app/modules/market-place/assets/svgs/back-button.svg"
import { useNavigation } from "@react-navigation/native"
import { color } from "@app/theme"
import { Row } from "../row"
import { fontSize } from "../../theme/typography"

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
    <Row
      containerStyle={[
        { width: "100%", justifyContent: "space-between", marginTop: 15 },
        style,
      ]}
    >
      <TouchableOpacity
        hitSlop={{ bottom: 5, left: 5, top: 5, right: 5 }}
        onPress={() => {
          if (navigation.canGoBack()) {
            navigation.goBack()
          }
        }}
      >
        <BackSvg fill={color.primary} />
      </TouchableOpacity>

      <Text style={{ fontSize: fontSize.font20 }}>
        {title}
      </Text>
      {rightComponent ? rightComponent : <View style={{ width: 24, height: 24 }} />}
    </Row>
  )
}
