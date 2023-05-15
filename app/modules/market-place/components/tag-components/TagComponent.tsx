import * as React from "react"
import { StyleProp, Text, TouchableOpacity, ViewStyle } from "react-native"
import { palette } from "@app/theme"
import XSvg from "@app/modules/market-place/assets/svgs/x.svg"
import { Row } from "../row"

export interface TagProps {
  style?: StyleProp<ViewStyle>
  onClear?: () => void
  title: string
  onPress?: () => void
  disabled?: boolean

  selectable?:boolean
  isSelected?:boolean
}

export const TagComponent: React.FC<TagProps> = React.memo(
  ({ style, title, onClear, disabled, onPress,selectable,isSelected }: TagProps) => {
    return (
      <TouchableOpacity
        activeOpacity={1}
        disabled={disabled}
        onPress={() => onPress && onPress()}
      >
        <Row
          containerStyle={[
            {
              paddingVertical: selectable ? 7 : 3,
              paddingHorizontal: selectable?15:7,
              borderRadius: selectable?20:12,
              backgroundColor: selectable ? (isSelected ? palette.blue : 'white') : palette.blue,
            },
            style,
          ]}
          hc
        >
          <Text style={{ color: selectable ? (isSelected ? 'white' : 'black') : "white" }}>{title}</Text>
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
