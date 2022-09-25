import React from "react"
import { StyleProp, View, ViewStyle } from "react-native"
interface RowProps {
  children: any
  containerStyle?: StyleProp<ViewStyle>
  vc?: boolean
  hc?:boolean
}
export const Row = ({ children, containerStyle, vc,hc }: RowProps) => {
  return <View style={[
    {
      flexDirection: "row"
    }, 
    containerStyle,
    vc && { justifyContent: 'center' },
    hc &&{alignItems:'center'}
  ]}>{children}</View>
}
