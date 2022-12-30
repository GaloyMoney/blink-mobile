import React, { useState, useEffect, useRef } from "react"
import { TextInput, View } from "react-native"
import { HiddenTextInput } from "../hidden-text-input"

interface CurrencyInputProps {
  currencyType: string
  onValueChange: (value: number) => void
}

export const CurrencyInput: React.FC<CurrencyInputProps> = ({
  currencyType,
  onValueChange,
}) => {
  const [inputValue, setInputValue] = useState(() => {
    if (currencyType === "BTC") {
      return "0 sats"
    } 
      return new Intl.NumberFormat("en-US", {
          style: "currency",
          currency: currencyType,
        }).format(0)
    
  })
  const inputRef = useRef(null)

  const formatDefaultValue = currencyType === "BTC" ? "0 sats" : new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: currencyType,
  }).format(0)

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
    console.log(strippedText)
    if (currencyType === "BTC") {
      formattedText = `${new Intl.NumberFormat("en-US", {
        useGrouping: true,
      }).format(Number(strippedText))} sats`
      onValueChange(Number(strippedText))
    } else {
      // Format the input value with commas as thousand separators
      formattedText = new Intl.NumberFormat("en-US", {
        style: "currency",
        currency: currencyType,
      }).format(Number(strippedText) * 10)
      onValueChange(Number(strippedText) * 100)
    }
    setInputValue(`${formattedText}`)
    // inputRef.current.setNativeProps({ value: formattedText })
  }

  // const handleSelectionChange = (event) => {
  //   const { selection } = event.nativeEvent
  //   if(currencyType === "USD" && selection !== 0){
  //     const newSelection = {
  //       start: selection.start + 2,
  //       end: selection.end + 2
  //     }
  //     inputRef.current.setNativeProps({ selection: newSelection })
  //   } else {
  //   inputRef.current.setNativeProps({ selection })
  //   }
  // }

  return (
    <View>
      {/* <TextInput
        ref={inputRef}
        value={inputValue}
        defaultValue={formatDefaultValue}
        onChangeText={handleChangeText}
        keyboardType="numeric"
        testID="currency-input"
        onSelectionChange={handleSelectionChange}
      /> */}
      <HiddenTextInput value={inputValue} onChangeText={handleChangeText} />
    </View>
  )
}
