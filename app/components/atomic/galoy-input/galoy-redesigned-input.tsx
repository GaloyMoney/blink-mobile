import * as React from "react"
import { StyleProp, TextInput, TextStyle, View } from "react-native"

import { Input, InputProps, Text, makeStyles, useTheme } from "@rneui/themed"

const useStyles = makeStyles(
  (theme, { props, isFocused }: { props: GaloyInputProps; isFocused: boolean }) => ({
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
    labelComponentStyles: {
      marginBottom: 9,
      fontWeight: "400",
      color: theme.colors.grey5,
      marginLeft: isFocused ? 2 : 10,
    },
    errorMessageStyles: {
      color: props.caption ? theme.colors.grey5 : theme.colors.error5,
      textTransform: "capitalize",
      marginTop: 9,
      marginLeft: isFocused ? 2 : 10,
    },
    labelStyle: {
      display: "none",
    },
    errorStyle: {
      display: "none",
    },
  }),
)

type GaloyInputProps = {
  initIsFocused?: boolean
  caption?: string
} & InputProps

const GaloyInputFunctions = (
  props: GaloyInputProps,
  ref: React.Ref<TextInput & React.PropsWithChildren<InputProps>>,
) => {
  const { theme } = useTheme()
  const { containerStyle, ...remainingProps } = props
  const [isFocused, setIsFocused] = React.useState(remainingProps.initIsFocused ?? false)
  const styles = useStyles({ props, isFocused })

  return (
    <View style={containerStyle}>
      <LabelComponent
        props={remainingProps}
        styles={styles.labelComponentStyles}
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
        styles={styles.errorMessageStyles}
        errorStyles={remainingProps.errorStyle}
      />
    </View>
  )
}

type LabelComponentProps = {
  props: GaloyInputProps
  labelStyle: StyleProp<TextStyle>
  styles: StyleProp<TextStyle>
}

const LabelComponent = ({ props, labelStyle, styles }: LabelComponentProps) => {
  if (!props.label) return null
  return (
    <Text type="p2" style={[styles, labelStyle]}>
      {props.label}
    </Text>
  )
}

type CaptionComponentProps = {
  props: GaloyInputProps
  errorStyles: StyleProp<TextStyle>
  styles: StyleProp<TextStyle>
}

const CaptionComponent = ({ props, errorStyles, styles }: CaptionComponentProps) => {
  if (!props.caption && !props.errorMessage) return null
  return (
    <Text type="p3" style={[styles, errorStyles]}>
      {props.caption || props.errorMessage}
    </Text>
  )
}

const GaloyInputRedesigned = React.forwardRef(GaloyInputFunctions)

export { GaloyInputRedesigned }
