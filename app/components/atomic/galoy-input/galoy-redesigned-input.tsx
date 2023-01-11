import * as React from "react"
import { StyleProp, Text, TextInput, View, ViewStyle } from "react-native"

import { Input, InputProps, makeStyles, useTheme } from "@rneui/themed"

import { ComponentType } from "../../../types/jsx"

const useStyles = makeStyles((theme) => ({
  ContainerStyle: {
    paddingBottom: 3,
    paddingTop: 3,
    marginLeft: 0,
    borderRadius: 10,
    backgroundColor: theme.colors.primary9,
  },
  inputContainerFocused: {
    borderColor: theme.colors.primary5,
    backgroundColor: theme.colors.white,
    marginLeft: -7,
    marginRight: -7,
  },
  errorStateStyle: {
    borderColor: theme.colors.error5,
  },
  labelStyle: {
    display: "none",
  },
  errorStyle: {
    display: "none",
  },
}))

type GaloyInputProps = {
  initIsFocused?: boolean
  caption?: string
} & InputProps

const GaloyInputFunctions = (
  props: GaloyInputProps,
  ref: React.Ref<TextInput> & React.Ref<React.PropsWithChildren<InputProps>>,
) => {
  const { theme } = useTheme()
  const { containerStyle, ...remainingProps } = props
  const styles = useStyles(remainingProps)
  const [isFocused, setIsFocused] = React.useState(remainingProps.initIsFocused ?? false)

  return (
    <View style={containerStyle}>
      <LabelComponent
        props={remainingProps}
        theme={theme}
        isFocused={isFocused}
        labelStyle={remainingProps.labelStyle}
      />
      <Input
        {...remainingProps}
        labelStyle={styles.labelStyle}
        errorStyle={styles.errorStyle}
        containerStyle={isFocused ? styles.ContainerStyle : null}
        inputContainerStyle={[
          remainingProps.inputContainerStyle,
          remainingProps.errorMessage ? styles.errorStateStyle : null,
          isFocused ? styles.inputContainerFocused : null,
        ]}
        placeholderTextColor={theme.colors.grey8}
        onFocus={(e) => {
          setIsFocused(true)
          remainingProps.onFocus?.(e)
        }}
        onBlur={(e) => {
          setIsFocused(false)
          remainingProps.onBlur?.(e)
        }}
        ref={ref}
      />
      <CaptionComponent
        props={remainingProps}
        isFocused={isFocused}
        theme={theme}
        errorStyles={remainingProps.errorStyle}
      />
    </View>
  )
}

const LabelComponent = ({ props, labelStyle, isFocused, theme }) => {
  if (!props.label) return null
  const styles = (): StyleProp<ViewStyle> => {
    const labelStyles = {
      marginLeft: isFocused ? 2 : 10,
      marginBottom: 9,
      fontWeight: "400",
      fontSize: 16,
      lineHeight: 24,
      color: theme.colors.grey5,
    }
    return labelStyles
  }
  return <Text style={[styles(), labelStyle]}>{props.label}</Text>
}

const CaptionComponent = ({ props, errorStyles, isFocused, theme }) => {
  if (!props.caption && !props.errorMessage) return null
  const styles = (): StyleProp<ViewStyle> => {
    const errorMessageStyles = {
      color: props.caption ? theme.colors.grey5 : theme.colors.error5,
      textTransform: "capitalize",
      fontSize: 14,
      marginTop: 9,
      lineHeight: 24,
      marginLeft: isFocused ? 2 : 10,
    }
    return errorMessageStyles
  }
  return (
    <Text style={[styles(), errorStyles]}>{props.caption || props.errorMessage}</Text>
  )
}

export const GaloyInputRedesigned: ComponentType = React.forwardRef(GaloyInputFunctions)
