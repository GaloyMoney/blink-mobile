import * as React from "react"
import { TextInput } from "react-native"

import { Input, InputProps, makeStyles, useTheme } from "@rneui/themed"

import { ComponentType } from "../../../types/jsx"

const useStyles = makeStyles((theme) => ({
  inputContainerFocused: {
    borderColor: theme.colors.primary5,
    backgroundColor: theme.colors.white,
    shadowOffset: { width: 3, height: 2 },
    shadowRadius: 2,
    shadowOpacity: 1,
  },
  captionStyle: {
    color: theme.colors.grey5,
    textTransform: "lowercase",
  },
}))

type GaloyInputProps = {
  initIsFocused?: boolean
  caption?: string
}

const GaloyInputFunctions = (
  props: InputProps & GaloyInputProps,
  ref: React.Ref<TextInput> & React.Ref<React.PropsWithChildren<InputProps>>,
) => {
  const { theme } = useTheme()
  const styles = useStyles(theme)
  const [isFocused, setIsFocused] = React.useState(props.initIsFocused ?? false)

  return (
    <Input
      {...props}
      inputContainerStyle={[
        props.inputContainerStyle,
        isFocused ? styles.inputContainerFocused : null,
      ]}
      placeholderTextColor={theme.colors.grey8}
      onFocus={(e) => {
        setIsFocused(true)
        props.onFocus?.(e)
      }}
      onBlur={(e) => {
        setIsFocused(false)
        props.onBlur?.(e)
      }}
      errorMessage={props.errorMessage ?? props.caption}
      errorStyle={props.errorMessage ? null : styles.captionStyle}
      ref={ref}
    />
  )
}

export const GaloyInputRedesigned: ComponentType = React.forwardRef(GaloyInputFunctions)
