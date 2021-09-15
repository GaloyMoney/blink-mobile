import toNumber from "lodash.tonumber"
import * as React from "react"
import { Keyboard, Text, View } from "react-native"
import { TextInput } from "react-native-vector-icons/node_modules/@types/react-native/index"
import EStyleSheet from "react-native-extended-stylesheet"
import { TouchableOpacity } from "react-native-gesture-handler"
import Icon from "react-native-vector-icons/Ionicons"
import { palette } from "../../theme/palette"
import type { ComponentType } from "../../types/jsx"
import { currencyToText, textToCurrency } from "../../utils/currencyConversion"
import { GaloyInput } from "../galoy-input"

const digitLimit = 10

const styles = EStyleSheet.create({
  container: {
    alignItems: "center",
  },

  icon: {
    paddingTop: 4,
  },

  inputContainer: {
    width: "100%",
  },

  inputMaskPositioning: {
    position: "absolute",
  },

  inputText: {
    opacity: 0,
  },

  main: {
    alignItems: "center",
    flexDirection: "row",
    marginTop: "20rem",
  },

  textStyle: {
    color: palette.darkGrey,
    fontSize: "35rem",
    fontWeight: "bold",
    textAlign: "center",
  },

  textStyleIcon: {
    fontSize: "18rem",
    textAlign: "center",
  },
})

type InputPaymentProps = {
  editable: boolean
  forceKeyboard: boolean
  nextPrefCurrency: () => void
  onBlur?: () => void
  onUpdateAmount: ({ moneyAmount: MoneyAmount }) => void
  primaryAmount: MoneyAmount
}

export const InputPayment: ComponentType = ({
  editable,
  forceKeyboard = false,
  nextPrefCurrency,
  onBlur = () => null,
  onUpdateAmount,
  primaryAmount,
}: InputPaymentProps) => {
  const [input, setInput] = React.useState("")
  const inputRef = React.useRef<TextInput>()

  const handleTextInputChange = React.useCallback(
    (text) => {
      const newInput = textToCurrency(
        text.replace(/[^0-9]/g, "").substring(0, digitLimit),
        primaryAmount.currency,
      )
      const newAmount = toNumber(newInput)

      setInput(newInput)

      if (!isNaN(newAmount)) {
        onUpdateAmount({
          moneyAmount: {
            value: newAmount,
            currency: primaryAmount.currency,
          },
        })
      }
    },
    [onUpdateAmount, primaryAmount.currency],
  )

  React.useEffect(() => {
    setInput(primaryAmount.value.toString().replace(/[^0-9.]/g, ""))
  }, [primaryAmount])

  React.useEffect(() => {
    Keyboard.addListener("keyboardDidHide", _keyboardDidHide)

    return () => {
      Keyboard.removeListener("keyboardDidHide", _keyboardDidHide)
    }
  }, [])

  const _keyboardDidHide = () => {
    inputRef?.current?.blur()
  }

  const displayValue = currencyToText(input, primaryAmount.currency)

  const leftIcon = () => {
    if (primaryAmount.currency === "USD") {
      return (
        <Text
          style={[
            styles.textStyleIcon,
            { color: primaryAmount.value === 0 ? palette.midGrey : palette.darkGrey },
          ]}
        >
          $
        </Text>
      )
    }

    return null
  }

  const rightIcon = () => {
    if (primaryAmount.currency === "BTC") {
      return (
        <Text
          style={[
            styles.textStyleIcon,
            { color: primaryAmount.value === 0 ? palette.midGrey : palette.darkGrey },
          ]}
        >
          sats
        </Text>
      )
    }

    return null
  }

  const inputMaskPositioningStyle = () => {
    const additionalMargin = displayValue.replace(/[^0-9]/g, "").length * 1.5

    if (primaryAmount.currency === "USD") {
      return {
        marginLeft: `${additionalMargin - 3}%`,
        width: `${103 - additionalMargin}%`,
      }
    } else if (primaryAmount.currency === "BTC") {
      return {
        marginRight: `${additionalMargin}%`,
        width: `${100 - additionalMargin}%`,
      }
    }

    return {
      width: "100%",
    }
  }

  return (
    <View style={styles.container}>
      <View style={styles.main}>
        <Text
          accessibilityLabel="Input payment display value"
          ellipsizeMode="middle"
          numberOfLines={1}
          style={[
            styles.textStyle,
            styles.inputMaskPositioning,
            inputMaskPositioningStyle(),
          ]}
        >
          {displayValue}
        </Text>
        <GaloyInput
          ref={inputRef}
          accessibilityLabel="Input payment"
          autoCorrect={false}
          autoFocus={forceKeyboard}
          value={displayValue}
          leftIcon={leftIcon()}
          rightIcon={rightIcon()}
          inputContainerStyle={styles.inputContainer}
          inputStyle={[styles.textStyle, styles.inputText]}
          contextMenuHidden
          onChangeText={handleTextInputChange}
          keyboardType={"number-pad"}
          onBlur={onBlur}
          enablesReturnKeyAutomatically
          returnKeyLabel="Update"
          returnKeyType="done"
          editable={editable}
          onEndEditing={onBlur}
          renderErrorMessage={false}
          selection={{ start: displayValue.length, end: displayValue.length }}
        />
        <TouchableOpacity onPress={nextPrefCurrency}>
          <Icon name="ios-swap-vertical" size={32} style={styles.icon} />
        </TouchableOpacity>
      </View>
    </View>
  )
}
