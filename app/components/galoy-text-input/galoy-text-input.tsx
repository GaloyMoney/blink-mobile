import { palette } from "@app/theme"
import React, { useState } from "react"
import { View, TouchableOpacity, TextInput } from "react-native"
import { Text } from "react-native-elements"
import EStyleSheet from "react-native-extended-stylesheet"

type GaloyTextInputProps = {
  placeholder?: string
  append?: string
  prepend?: string
  validation?: [() => boolean]
  label: string
  onChangeText: (text: string) => void
  labelStyle?: EStyleSheet.AnyObject
}

const styles = EStyleSheet.create({
  container: {
    flexDirection: "column",
  },
  labelContainer: {
    flex: 1,
  },
  inputContainer: {
    flexDirection: "row",
    backgroundColor: palette.inputBackground,
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 8,
    overflow: "hidden",
  },
  label: {
    color: palette.inputLabel,
    fontSize: 18,
    lineHeight: 24,
    fontFamily: "Roboto",
    fontWeight: "500",
  },
  input: {
    flex: 1,
  },
  appendTextStyle: {
    color: palette.secondaryText,
  },
  prependTextStyle: {
    color: palette.secondaryText,
  },
})

export const GaloyTextInput = ({
  placeholder,
  label,
  labelStyle,
  append = "",
  prepend = "",
  onChangeText,
}: GaloyTextInputProps) => {
  const [inputValue, setInputValue] = useState("")
  const textInputRef = React.useRef<TextInput>(null)
  const updateValue = (value) => {
    onChangeText(value)
    setInputValue(value)
  }

  return (
    <View style={styles.container}>
      <View style={styles.labelContainer}>
        <Text style={labelStyle ? { ...styles.label, ...labelStyle } : styles.label}>
          {label}
        </Text>
      </View>
      <TouchableOpacity activeOpacity={1} onPress={() => textInputRef.current.focus()}>
        <View style={styles.inputContainer}>
          {prepend && <Text style={styles.prependTextStyle}>{prepend}</Text>}
          <TextInput
            ref={textInputRef}
            autoCorrect={false}
            autoCapitalize={"none"}
            selectTextOnFocus={false}
            autoComplete={"off"}
            style={styles.input}
            textAlign={"left"}
            placeholder={placeholder}
            onChangeText={updateValue}
            defaultValue={inputValue}
          ></TextInput>
          {append && <Text style={styles.appendTextStyle}>{append}</Text>}
        </View>
      </TouchableOpacity>
    </View>
  )
}
