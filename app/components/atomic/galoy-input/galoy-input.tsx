import * as React from "react"
import { StyleSheet, TextInput } from "react-native"
import { Input, InputProps } from "@rneui/themed"
import { color } from "../../../theme"

const styles = StyleSheet.create({
  inputContainerFocused: {
    borderBottomColor: color.palette.darkGrey,
  },
})

type GaloyInputProps = {
  initIsFocused?: boolean
}

const GaloyInputFunction = (
  props: InputProps & GaloyInputProps,
  ref: React.Ref<TextInput & React.PropsWithChildren<InputProps>>,
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

const GaloyInput = React.forwardRef(GaloyInputFunction)

export { GaloyInput }
