import React, { useState, useEffect, useRef } from "react"
import { TextInput, View } from "react-native"

interface CurrencyInputProps {
  currencyType: string
  onValueChange: (value: number) => void
}

export const CurrencyInput: React.FC<CurrencyInputProps> = ({
  currencyType,
  onValueChange,
}) => {
  const inputRef = useRef(null)

  const [inputValue, setInputValue] = useState(() => {
    if (currencyType === "BTC") {
      return "0 sats"
    }
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: currencyType,
    }).format(0)
  })

  useEffect(() => {
    if (currencyType === "BTC") {
      setInputValue("0 sats")
    } else {
      setInputValue(
        new Intl.NumberFormat("en-US", {
          style: "currency",
          currency: currencyType,
        }).format(0),
      )
    }
  }, [currencyType])

  const handleChangeText = (text: string) => {
    // Strip out non-numeric characters from the input value
    let formattedText
    const strippedText = text.replace(/[^\d.]/g, "")
    if (currencyType === "BTC") {
      formattedText = `${new Intl.NumberFormat("en-US", {
        useGrouping: true,
      }).format(Number(strippedText))} sats`
    } else {
      // Format the input value with commas as thousand separators
      formattedText = new Intl.NumberFormat("en-US", {
        style: "currency",
        currency: currencyType,
      }).format(Number(strippedText) / 100)
    }
    setInputValue(`${formattedText}`)
    onValueChange(Number(strippedText))
  }

  const handleSelectionChange = (event) => {
    const { selection } = event.nativeEvent
    inputRef.current.setNativeProps({ selection })
  }

  return (
    <View>
      <TextInput
        ref={inputRef}
        value={inputValue}
        onChangeText={handleChangeText}
        keyboardType="numeric"
        testID="currency-input"
        onSelectionChange={handleSelectionChange}
      />
    </View>
  )
}
