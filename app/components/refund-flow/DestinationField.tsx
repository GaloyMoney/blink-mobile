import React from "react"
import { TextInput, TouchableWithoutFeedback, View } from "react-native"
import { makeStyles, useTheme, Text } from "@rneui/themed"
import Clipboard from "@react-native-clipboard/clipboard"
import Icon from "react-native-vector-icons/Ionicons"
import { useI18nContext } from "@app/i18n/i18n-react"

// assets
import ScanIcon from "@app/assets/icons/scan.svg"

// utils
import { testProps } from "../../utils/testProps"

type Props = {
  destination?: string
  status: string
  validateDestination: () => void
  handleChangeText: (val: string) => void
  setDestination: (val: string) => void
  navigateToScanning: () => void
}

const DestinationField: React.FC<Props> = ({
  destination,
  status,
  validateDestination,
  handleChangeText,
  setDestination,
  navigateToScanning,
}) => {
  const styles = usestyles()
  const { colors } = useTheme().theme
  const { LL } = useI18nContext()

  const onPaste = async () => {
    const clipboard = await Clipboard.getString()
    setDestination(clipboard)
  }

  let inputContainerStyle
  switch (status) {
    case "invalid":
      inputContainerStyle = styles.errorInputContainer
      break
    case "valid":
      inputContainerStyle = styles.validInputContainer
      break
    default:
      inputContainerStyle = styles.enteringInputContainer
  }

  return (
    <View>
      <Text
        {...testProps(LL.SendBitcoinScreen.destination())}
        style={styles.fieldTitleText}
      >
        {LL.SendBitcoinScreen.destination()}
      </Text>

      <View style={[styles.fieldBackground, inputContainerStyle]}>
        <TextInput
          {...testProps(LL.SendBitcoinScreen.placeholder())}
          style={styles.input}
          placeholder={LL.SendBitcoinScreen.placeholder()}
          placeholderTextColor={colors.grey2}
          onChangeText={handleChangeText}
          value={destination}
          onSubmitEditing={validateDestination}
          selectTextOnFocus
          autoCapitalize="none"
          autoCorrect={false}
        />
        <TouchableWithoutFeedback onPress={navigateToScanning}>
          <View style={styles.iconContainer}>
            <ScanIcon fill={colors.primary} />
          </View>
        </TouchableWithoutFeedback>
        <TouchableWithoutFeedback onPress={onPaste}>
          <View style={styles.iconContainer}>
            <Icon name="clipboard-outline" color={colors.primary} size={22} />
          </View>
        </TouchableWithoutFeedback>
      </View>
    </View>
  )
}

export default DestinationField

const usestyles = makeStyles(({ colors }) => ({
  fieldBackground: {
    flexDirection: "row",
    borderStyle: "solid",
    overflow: "hidden",
    backgroundColor: colors.grey5,
    borderRadius: 10,
    justifyContent: "center",
    alignItems: "center",
    height: 60,
    marginBottom: 5,
  },
  enteringInputContainer: {},
  errorInputContainer: {
    borderColor: colors.error,
    borderWidth: 1,
  },
  validInputContainer: {
    borderColor: colors.green,
    borderWidth: 1,
  },
  warningInputContainer: {
    borderColor: colors.warning,
    borderWidth: 1,
  },
  input: {
    flex: 1,
    paddingHorizontal: 12,
    color: colors.black,
  },
  fieldTitleText: {
    fontWeight: "bold",
    marginBottom: 10,
  },
  iconContainer: {
    width: 50,
    justifyContent: "center",
    alignItems: "center",
  },
}))
