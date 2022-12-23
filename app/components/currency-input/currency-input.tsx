import React, { useState, useEffect } from "react"
import { TextInput, View } from "react-native"

interface CurrencyInputProps {
  currencyType: string
  onValueChange: (value: number) => void
}

export const CurrencyInput: React.FC<CurrencyInputProps> = ({
  currencyType,
  onValueChange,
}) => {
  const [currencySymbol, setCurrencySymbol] = useState(() => {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: currencyType,
    })
      .format(1)
      .charAt(0)
  })
  const [inputValue, setInputValue] = useState(`${currencySymbol}0.00`)

  useEffect(() => {
    setCurrencySymbol(
      new Intl.NumberFormat("en-US", {
        style: "currency",
        currency: currencyType,
      })
        .format(1)
        .charAt(0),
    )
  }, [currencyType])

  const handleChangeText = (text: string) => {
    // Strip out non-numeric characters from the input value
    const strippedText = text.replace(/[^\d.]/g, "")
    // Format the input value with commas as thousand separators
    const formattedText = new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: currencyType,
    }).format(Number(strippedText) / 100)
    setInputValue(`${formattedText}`)
    onValueChange(Number(strippedText))
  }

  return (
    <View>
      <TextInput
        value={inputValue}
        onChangeText={handleChangeText}
        keyboardType="numeric"
        testID="currency-input"
      />
    </View>
  )
}
