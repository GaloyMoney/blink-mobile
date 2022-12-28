import * as React from "react"
import { TextInput } from "react-native"
import EStyleSheet from "react-native-extended-stylesheet"

import colors from "@app/rne-theme/colors"
import { Input, InputProps } from "@rneui/themed"

import { ComponentType } from "../../../types/jsx"

const styles = EStyleSheet.create({
  inputContainerFocused: {
    borderColor: colors.primary5,
    backgroundColor: colors.white,
    shadowOffset: { width: 3, height: 2 },
    shadowRadius: 2,
    shadowOpacity: 1,
  },
  captionStyle: {
    color: colors.grey5,
    textTransform: "lowercase",
  },
})

type GaloyInputProps = {
  initIsFocused?: boolean
  caption?: string
}

const GaloyInputFunctions = (
  props: InputProps & GaloyInputProps,
  ref: React.Ref<TextInput> & React.Ref<React.PropsWithChildren<InputProps>>,
) => {
  const [isFocused, setIsFocused] = React.useState(props.initIsFocused ?? false)

  return (
    <Input
      {...props}
      label={props.label ?? null}
      inputContainerStyle={[
        props.inputContainerStyle,
        isFocused ? styles.inputContainerFocused : null,
      ]}
      placeholder={props.placeholder ?? null}
      placeholderTextColor={colors.grey8}
      onFocus={(e) => {
        setIsFocused(true)
        props.onFocus?.(e)
      }}
      onBlur={(e) => {
        setIsFocused(false)
        props.onBlur?.(e)
      }}
      errorMessage={props.errorMessage ?? props.caption}
      errorStyle={props.errorMessage ? styles.errorMessageStyle : styles.captionStyle}
      ref={ref}
    />
  )
}

export const GaloyInputRedesigned: ComponentType = React.forwardRef(GaloyInputFunctions)
