import React, { useCallback, useEffect, useMemo, useReducer } from "react"
import {
  KeyboardAvoidingView,
  Platform,
  StyleSheet,
  Text,
  TextInput,
  TouchableWithoutFeedback,
  View,
} from "react-native"
import Paste from "react-native-vector-icons/FontAwesome"

import { gql } from "@apollo/client"
import ScanIcon from "@app/assets/icons/scan.svg"
import {
  useSendBitcoinDestinationQuery,
  useUserDefaultWalletIdLazyQuery,
} from "@app/graphql/generated"
import { useI18nContext } from "@app/i18n/i18n-react"
import { RootStackParamList } from "@app/navigation/stack-param-lists"
import { palette } from "@app/theme"
import { logPaymentDestinationAccepted } from "@app/utils/analytics"
import { toastShow } from "@app/utils/toast"
import { PaymentType } from "@galoymoney/client/dist/parsing-v2"
import Clipboard from "@react-native-clipboard/clipboard"
import crashlytics from "@react-native-firebase/crashlytics"
import { StackScreenProps } from "@react-navigation/stack"
import { Button } from "@rneui/base"

import { testProps } from "../../utils/testProps"
import { ConfirmDestinationModal } from "./confirm-destination-modal"
import { DestinationInformation } from "./destination-information"
import {
  DestinationState,
  SendBitcoinActions,
  sendBitcoinDestinationReducer,
  SendBitcoinDestinationState,
} from "./send-bitcoin-reducer"
import { parseDestination } from "./payment-destination"
import { DestinationDirection } from "./payment-destination/index.types"
import { useIsAuthed } from "@app/graphql/is-authed-context"

const Styles = StyleSheet.create({
  scrollView: {
    flexDirection: "column",
    padding: 20,
    flex: 1,
  },
  contentContainer: {
    flexGrow: 1,
  },
  errorContainer: {
    margin: 20,
  },
  errorText: {
    color: palette.red,
    textAlign: "center",
  },
  sendBitcoinDestinationContainer: {
    flex: 1,
  },
  fieldBackground: {
    flexDirection: "row",
    borderStyle: "solid",
    overflow: "hidden",
    backgroundColor: palette.white,
    borderRadius: 10,
    justifyContent: "center",
    alignItems: "center",
    height: 60,
    marginBottom: 10,
  },
  enteringInputContainer: {},
  errorInputContainer: {
    borderColor: palette.red,
    borderWidth: 1,
  },
  validInputContainer: {
    borderColor: palette.green,
    borderWidth: 1,
  },
  warningInputContainer: {
    borderColor: palette.orange,
    borderWidth: 1,
  },
  buttonContainer: {
    flex: 1,
    justifyContent: "flex-end",
    marginBottom: 50,
  },
  input: {
    flex: 1,
    paddingHorizontal: 12,
  },
  button: {
    height: 50,
    borderRadius: 10,
  },
  disabledButtonStyle: {
    backgroundColor: "rgba(83, 111, 242, 0.1)",
  },
  disabledButtonTitleStyle: {
    color: palette.lightBlue,
    fontWeight: "600",
  },
  activeButtonStyle: {
    backgroundColor: palette.lightBlue,
  },
  activeButtonTitleStyle: {
    color: palette.white,
    fontWeight: "bold",
  },
  fieldTitleText: {
    fontWeight: "bold",
    color: palette.lapisLazuli,
    marginBottom: 5,
  },
  iconContainer: {
    width: 50,
    justifyContent: "center",
    alignItems: "center",
  },
})

// FIXME this should come from globals.lightningAddressDomainAliases
export const lnurlDomains = ["ln.bitcoinbeach.com", "pay.bbw.sv"]

gql`
  query sendBitcoinDestination {
    globals {
      network
    }
    me {
      id
      defaultAccount {
        id
        wallets {
          id
        }
      }
      contacts {
        id
        username
      }
    }
  }

  # TODO replace with AccountDefaultWallet?
  query userDefaultWalletId($username: Username!) {
    userDefaultWalletId(username: $username)
  }
`

export const defaultDestinationState: SendBitcoinDestinationState = {
  unparsedDestination: "",
  destinationState: DestinationState.Entering,
}

const SendBitcoinDestinationScreen = ({
  navigation,
  route,
}: StackScreenProps<RootStackParamList, "sendBitcoinDestination">) => {
  const [destinationState, dispatchDestinationStateAction] = useReducer(
    sendBitcoinDestinationReducer,
    defaultDestinationState,
  )
  const [goToNextScreenWhenValid, setGoToNextScreenWhenValid] = React.useState(false)

  const { data } = useSendBitcoinDestinationQuery({
    fetchPolicy: "cache-first",
    returnPartialData: true,
    skip: !useIsAuthed(),
  })
  const wallets = data?.me?.defaultAccount.wallets
  const bitcoinNetwork = data?.globals?.network
  const contacts = useMemo(() => data?.me?.contacts ?? [], [data?.me?.contacts])

  const { LL } = useI18nContext()
  const [userDefaultWalletIdQuery] = useUserDefaultWalletIdLazyQuery({
    fetchPolicy: "no-cache",
  })

  const validateDestination = useMemo(() => {
    if (!bitcoinNetwork || !wallets || !contacts) {
      return null
    }

    return async (rawInput: string) => {
      if (destinationState.destinationState !== "entering") {
        return
      }

      dispatchDestinationStateAction({
        type: "set-validating",
        payload: {
          unparsedDestination: rawInput,
        },
      })

      const destination = await parseDestination({
        rawInput,
        myWalletIds: wallets.map((wallet) => wallet.id),
        bitcoinNetwork,
        lnurlDomains,
        userDefaultWalletIdQuery,
      })

      if (destination.valid === false) {
        return dispatchDestinationStateAction({
          type: SendBitcoinActions.SetInvalid,
          payload: {
            invalidDestination: destination,
            unparsedDestination: rawInput,
          },
        })
      }

      if (
        destination.destinationDirection === DestinationDirection.Send &&
        destination.validDestination.paymentType === PaymentType.Intraledger
      ) {
        if (
          !contacts
            .map((contact) => contact.username.toLowerCase())
            .includes(destination.validDestination.handle.toLowerCase())
        ) {
          return dispatchDestinationStateAction({
            type: SendBitcoinActions.SetRequiresConfirmation,
            payload: {
              validDestination: destination,
              unparsedDestination: rawInput,
              confirmationType: {
                type: "new-username",
                username: destination.validDestination.handle,
              },
            },
          })
        }
      }

      return dispatchDestinationStateAction({
        type: SendBitcoinActions.SetValid,
        payload: {
          validDestination: destination,
          unparsedDestination: rawInput,
        },
      })
    }
  }, [
    bitcoinNetwork,
    wallets,
    contacts,
    destinationState.destinationState,
    userDefaultWalletIdQuery,
    dispatchDestinationStateAction,
  ])

  const handleChangeText = useCallback(
    (newDestination: string) => {
      dispatchDestinationStateAction({
        type: "set-unparsed-destination",
        payload: { unparsedDestination: newDestination },
      })
      setGoToNextScreenWhenValid(false)
    },
    [dispatchDestinationStateAction, setGoToNextScreenWhenValid],
  )

  useEffect(() => {
    if (
      !goToNextScreenWhenValid ||
      destinationState.destinationState !== DestinationState.Valid
    ) {
      return
    }

    if (destinationState.destination.destinationDirection === DestinationDirection.Send) {
      // go to send bitcoin details screen
      logPaymentDestinationAccepted(
        destinationState.destination.validDestination.paymentType,
      )
      setGoToNextScreenWhenValid(false)
      return navigation.navigate("sendBitcoinDetails", {
        paymentDestination: destinationState.destination,
      })
    }

    if (
      destinationState.destination.destinationDirection === DestinationDirection.Receive
    ) {
      // go to redeem bitcoin screen
      setGoToNextScreenWhenValid(false)
      return navigation.navigate("redeemBitcoinDetail", {
        receiveDestination: destinationState.destination,
      })
    }
  }, [destinationState, goToNextScreenWhenValid, navigation, setGoToNextScreenWhenValid])

  const initiateGoToNextScreen =
    validateDestination &&
    (async () => {
      validateDestination(destinationState.unparsedDestination)
      setGoToNextScreenWhenValid(true)
    })

  useEffect(() => {
    // If we scan a QR code encoded with a payment url for a specific user e.g. https://{domain}/{username}
    // then we want to detect the username as the destination
    if (route.params?.payment) {
      handleChangeText(route.params?.payment)
    }
  }, [route.params?.payment, handleChangeText])

  useEffect(() => {
    if (route.params?.username) {
      handleChangeText(route.params?.username)
    }
  }, [route.params?.username, handleChangeText])

  let inputContainerStyle
  switch (destinationState.destinationState) {
    case "entering":
    case "validating":
      inputContainerStyle = Styles.enteringInputContainer
      break
    case "invalid":
      inputContainerStyle = Styles.errorInputContainer
      break
    case "valid":
      if (!destinationState.confirmationType) {
        inputContainerStyle = Styles.validInputContainer
        break
      }
      inputContainerStyle = Styles.warningInputContainer
      break
    case "requires-confirmation":
      inputContainerStyle = Styles.warningInputContainer
  }

  return (
    <KeyboardAvoidingView
      style={Styles.scrollView}
      behavior={Platform.OS === "ios" ? "padding" : "height"}
      keyboardVerticalOffset={50}
    >
      <ConfirmDestinationModal
        destinationState={destinationState}
        dispatchDestinationStateAction={dispatchDestinationStateAction}
      />
      <View style={Styles.sendBitcoinDestinationContainer}>
        <Text style={Styles.fieldTitleText}>{LL.SendBitcoinScreen.destination()}</Text>

        <View style={[Styles.fieldBackground, inputContainerStyle]}>
          <TextInput
            {...testProps(LL.SendBitcoinScreen.input())}
            style={Styles.input}
            placeholder={LL.SendBitcoinScreen.input()}
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
            <View style={Styles.iconContainer}>
              <ScanIcon />
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
            <View style={Styles.iconContainer}>
              <Paste name="paste" color={palette.primaryButtonColor} />
            </View>
          </TouchableWithoutFeedback>
        </View>
        <DestinationInformation destinationState={destinationState} />
        <View style={Styles.buttonContainer}>
          <Button
            {...testProps(LL.common.next())}
            title={
              destinationState.unparsedDestination
                ? LL.common.next()
                : LL.SendBitcoinScreen.destinationIsRequired()
            }
            loading={destinationState.destinationState === "validating"}
            buttonStyle={[Styles.button, Styles.activeButtonStyle]}
            titleStyle={Styles.activeButtonTitleStyle}
            disabledStyle={[Styles.button, Styles.disabledButtonStyle]}
            disabledTitleStyle={Styles.disabledButtonTitleStyle}
            disabled={
              destinationState.destinationState === "validating" ||
              destinationState.destinationState === "invalid" ||
              !destinationState.unparsedDestination ||
              !initiateGoToNextScreen
            }
            onPress={initiateGoToNextScreen || undefined}
          />
        </View>
      </View>
    </KeyboardAvoidingView>
  )
}

export default SendBitcoinDestinationScreen
