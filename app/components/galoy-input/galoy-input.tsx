import * as React from "react"
import { TextInput } from "react-native"
import { Input, InputProps } from "react-native-elements"
import EStyleSheet from "react-native-extended-stylesheet"
import { color } from "../../theme"
import { ComponentType } from "../../types/jsx"

const styles = EStyleSheet.create({
  inputContainerFocused: {
    borderBottomColor: color.palette.darkGrey,
  },
})

type GaloyInputProps = {
  initIsFocused?: boolean
}

const GaloyInputFunction = (
  props: InputProps & GaloyInputProps,
  ref: React.Ref<TextInput>,
) => {
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
      ref={ref}
      autoComplete="off"
    />
  )
}

export const GaloyInput: ComponentType = React.forwardRef(GaloyInputFunction)
