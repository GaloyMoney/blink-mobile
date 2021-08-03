import * as React from "react"
import { TextInput } from "react-native-vector-icons/node_modules/@types/react-native/index"
import { Input, InputProps } from "react-native-elements"
import EStyleSheet from "react-native-extended-stylesheet"
import { color } from "../../theme"
import { ComponentType } from "../../types/jsx"

const styles = EStyleSheet.create({
  inputContainerFocused: {
    borderBottomColor: color.palette.lightBlue,
  },
})

type GaloyInputProps = {
  initIsFocused?: boolean
  forwardedRef?: React.Ref<TextInput>
}

export const GaloyInput: ComponentType = (props: InputProps & GaloyInputProps) => {
  const [isFocused, setIsFocused] = React.useState(props.initIsFocused ?? false)

  return (
    <Input
      {...props}
      inputContainerStyle={[
        props.inputContainerStyle,
        isFocused ? styles.inputContainerFocused : null,
      ]}
      onFocus={(e) => {
        setIsFocused(true)
        props.onFocus?.(e)
      }}
      onBlur={(e) => {
        setIsFocused(false)
        props.onBlur?.(e)
      }}
      ref={props.forwardedRef}
    />
  )
}
