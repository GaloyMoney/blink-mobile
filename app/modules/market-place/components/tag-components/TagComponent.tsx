import * as React from "react"
import { StyleProp, Text, TouchableOpacity, ViewStyle } from "react-native"
import EStyleSheet from "react-native-extended-stylesheet"
import { palette } from "@app/theme"
import XSvg from "@app/modules/market-place/assets/svgs/x.svg"
import { Row } from "../row"
const styles = EStyleSheet.create({})

export interface TagProps {
  style?: StyleProp<ViewStyle>
  onClear?: () => void
  title: string
  onPress?: () => void
  disabled?: boolean
}

export const TagComponent: React.FC<TagProps> = React.memo(
  ({ style, title, onClear, disabled, onPress }: TagProps) => {
    return (
      <TouchableOpacity
        activeOpacity={1}
        disabled={disabled}
        onPress={() => onPress && onPress()}
      >
        <Row
          containerStyle={[
            {
              paddingVertical: 3,
              paddingHorizontal: 7,
              borderRadius: 12,
              backgroundColor: palette.blue,
            },
            style,
          ]}
          hc
        >
          <Text style={{ color: "white" }}>{title}</Text>
          {onClear ? (
            <TouchableOpacity
              onPress={() => onClear && onClear()}
              hitSlop={{ right: 5, left: 5, bottom: 5, top: 5 }}
            >
              <XSvg height={15} stroke="white" />
            </TouchableOpacity>
          ) : null}
        </Row>
      </TouchableOpacity>
    )
  },
)
