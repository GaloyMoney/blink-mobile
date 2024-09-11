import React from "react"
import { TextInput, TouchableWithoutFeedback, View } from "react-native"
import crashlytics from "@react-native-firebase/crashlytics"
import { makeStyles, useTheme, Text } from "@rneui/themed"
import Clipboard from "@react-native-clipboard/clipboard"
import { useNavigation } from "@react-navigation/native"
import Icon from "react-native-vector-icons/Ionicons"
import { useI18nContext } from "@app/i18n/i18n-react"
import { StackNavigationProp } from "@react-navigation/stack"
import { RootStackParamList } from "@app/navigation/stack-param-lists"

// assets
import ScanIcon from "@app/assets/icons/scan.svg"

// utils
import { toastShow } from "@app/utils/toast"
import { testProps } from "../../utils/testProps"

type Props = {
  validateDestination: (val: string) => void
  handleChangeText: (val: string) => void
  destinationState: any
  dispatchDestinationStateAction: any
}

const DestinationField: React.FC<Props> = ({
  validateDestination,
  handleChangeText,
  destinationState,
  dispatchDestinationStateAction,
}) => {
  const styles = usestyles()
  const { colors } = useTheme().theme
  const { LL } = useI18nContext()
  const navigation =
    useNavigation<StackNavigationProp<RootStackParamList, "sendBitcoinDestination">>()

  let inputContainerStyle
  switch (destinationState.destinationState) {
    case "entering":
    case "validating":
      inputContainerStyle = styles.enteringInputContainer
      break
    case "invalid":
      inputContainerStyle = styles.errorInputContainer
      break
    case "valid":
      if (!destinationState.confirmationType) {
        inputContainerStyle = styles.validInputContainer
        break
      }
      inputContainerStyle = styles.warningInputContainer
      break
    case "requires-confirmation":
      inputContainerStyle = styles.warningInputContainer
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
          value={destinationState.unparsedDestination}
          onSubmitEditing={() =>
            validateDestination &&
            validateDestination(destinationState.unparsedDestination)
          }
          selectTextOnFocus
          autoCapitalize="none"
          autoCorrect={false}
        />
        <TouchableWithoutFeedback onPress={() => navigation.navigate("scanningQRCode")}>
          <View style={styles.iconContainer}>
            <ScanIcon fill={colors.primary} />
          </View>
        </TouchableWithoutFeedback>
        <TouchableWithoutFeedback
          onPress={async () => {
            try {
              const clipboard = await Clipboard.getString()
              dispatchDestinationStateAction({
                type: "set-unparsed-destination",
                payload: {
                  unparsedDestination: clipboard,
                },
              })
              validateDestination && (await validateDestination(clipboard))
            } catch (err) {
              if (err instanceof Error) {
                crashlytics().recordError(err)
              }
              toastShow({
                type: "error",
                message: (translations) =>
                  translations.SendBitcoinDestinationScreen.clipboardError(),
                currentTranslation: LL,
              })
            }
          }}
        >
          <View style={styles.iconContainer}>
            {/* we could Paste from "FontAwesome" but as svg*/}
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
    marginBottom: 10,
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
    marginBottom: 5,
  },
  iconContainer: {
    width: 50,
    justifyContent: "center",
    alignItems: "center",
  },
}))
