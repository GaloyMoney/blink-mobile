import { palette } from "@app/theme"
import React, { useState } from "react"
import { TextInput, View } from "react-native"
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
  label: {
    color: palette.inputLabel,
    fontSize: 18,
    lineHeight: 24,
    fontFamily: "Roboto",
    fontWeight: "500",
  },
  input: {
    backgroundColor: palette.inputBackground,
    borderRadius: 8,
    paddingVertical: 8,
    paddingHorizontal: 12,
    fontSize: 20,
    height: 50,
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
  const [cleanValue, setCleanValue] = useState("")

  const updateValue = (value) => {
    let cleanedValue = value
    if (prepend && cleanedValue.startsWith(prepend)) {
      cleanedValue = cleanedValue.slice(prepend.length)
    }
    if (append && cleanedValue.endsWith(append)) {
      cleanedValue = cleanedValue.slice(0, value.length - append.length)
    }
    onChangeText(cleanedValue)
    if (cleanedValue !== cleanValue) {
      setCleanValue(cleanedValue)
    }
  }

  return (
    <View style={styles.container}>
      <View style={styles.labelContainer}>
        <Text style={labelStyle ? { ...styles.label, ...labelStyle } : styles.label}>
          {label}
        </Text>
      </View>
      <View>
        <TextInput
          style={styles.input}
          placeholder={placeholder}
          onChangeText={updateValue}
          selection={{
            start: prepend.length + cleanValue.length,
            end: prepend.length + cleanValue.length,
          }}
        >
          {prepend && <Text style={styles.prependTextStyle}>{prepend}</Text>}
          <Text>{cleanValue}</Text>
          {append && <Text style={styles.appendTextStyle}>{append}</Text>}
        </TextInput>
      </View>
    </View>
  )
}
