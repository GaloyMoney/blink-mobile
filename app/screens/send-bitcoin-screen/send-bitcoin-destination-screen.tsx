import React, { useCallback, useEffect, useMemo, useReducer } from "react"
import { TextInput, TouchableWithoutFeedback, View } from "react-native"
import Icon from "react-native-vector-icons/Ionicons"
import { Screen } from "@app/components/screen"
import { gql } from "@apollo/client"
import ScanIcon from "@app/assets/icons/scan.svg"
import {
  useAccountDefaultWalletLazyQuery,
  useRealtimePriceQuery,
  useSendBitcoinDestinationQuery,
} from "@app/graphql/generated"
import { useI18nContext } from "@app/i18n/i18n-react"
import { RootStackParamList } from "@app/navigation/stack-param-lists"
import { logParseDestinationResult } from "@app/utils/analytics"
import { toastShow } from "@app/utils/toast"
import { PaymentType } from "@galoymoney/client"
import Clipboard from "@react-native-clipboard/clipboard"
import crashlytics from "@react-native-firebase/crashlytics"
import { StackNavigationProp } from "@react-navigation/stack"

import { LNURL_DOMAINS } from "@app/config"
import { useIsAuthed } from "@app/graphql/is-authed-context"
import { RouteProp, useNavigation } from "@react-navigation/native"
import { makeStyles, useTheme, Text } from "@rneui/themed"
import { testProps } from "../../utils/testProps"
import { ConfirmDestinationModal } from "./confirm-destination-modal"
import { DestinationInformation } from "./destination-information"
import { parseDestination } from "./payment-destination"
import {
  DestinationDirection,
  InvalidDestinationReason,
} from "./payment-destination/index.types"
import {
  DestinationState,
  SendBitcoinActions,
  sendBitcoinDestinationReducer,
  SendBitcoinDestinationState,
} from "./send-bitcoin-reducer"
import { GaloyPrimaryButton } from "@app/components/atomic/galoy-primary-button"

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

  query accountDefaultWallet($username: Username!) {
    accountDefaultWallet(username: $username) {
      id
    }
  }
`

export const defaultDestinationState: SendBitcoinDestinationState = {
  unparsedDestination: "",
  destinationState: DestinationState.Entering,
}

type Props = {
  route: RouteProp<RootStackParamList, "sendBitcoinDestination">
}

const SendBitcoinDestinationScreen: React.FC<Props> = ({ route }) => {
  const styles = usestyles()
  const {
    theme: { colors },
  } = useTheme()

  const navigation =
    useNavigation<StackNavigationProp<RootStackParamList, "sendBitcoinDestination">>()
  const isAuthed = useIsAuthed()

  const [destinationState, dispatchDestinationStateAction] = useReducer(
    sendBitcoinDestinationReducer,
    defaultDestinationState,
  )
  const [goToNextScreenWhenValid, setGoToNextScreenWhenValid] = React.useState(false)

  const { data } = useSendBitcoinDestinationQuery({
    fetchPolicy: "cache-first",
    returnPartialData: true,
    skip: !isAuthed,
  })

  // forcing price refresh
  useRealtimePriceQuery({
    fetchPolicy: "network-only",
    skip: !isAuthed,
  })

  const wallets = data?.me?.defaultAccount.wallets
  const bitcoinNetwork = data?.globals?.network
  const contacts = useMemo(() => data?.me?.contacts ?? [], [data?.me?.contacts])

  const { LL } = useI18nContext()
  const [accountDefaultWalletQuery] = useAccountDefaultWalletLazyQuery({
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
        lnurlDomains: LNURL_DOMAINS,
        accountDefaultWalletQuery,
      })
      logParseDestinationResult(destination)

      if (destination.valid === false) {
        if (destination.invalidReason === InvalidDestinationReason.SelfPayment) {
          dispatchDestinationStateAction({
            type: SendBitcoinActions.SetUnparsedDestination,
            payload: {
              unparsedDestination: rawInput,
            },
          })
          navigation.navigate("conversionDetails")
          return
        }

        dispatchDestinationStateAction({
          type: SendBitcoinActions.SetInvalid,
          payload: {
            invalidDestination: destination,
            unparsedDestination: rawInput,
          },
        })
        return
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
          dispatchDestinationStateAction({
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
          return
        }
      }

      dispatchDestinationStateAction({
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
    accountDefaultWalletQuery,
    dispatchDestinationStateAction,
    navigation,
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
      setGoToNextScreenWhenValid(false)
      navigation.navigate("sendBitcoinDetails", {
        paymentDestination: destinationState.destination,
      })
      return
    }

    if (
      destinationState.destination.destinationDirection === DestinationDirection.Receive
    ) {
      // go to redeem bitcoin screen
      setGoToNextScreenWhenValid(false)
      navigation.navigate("redeemBitcoinDetail", {
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
    if (route.params?.payment) {
      handleChangeText(route.params?.payment)
    }
  }, [route.params?.payment, handleChangeText])

  useEffect(() => {
    if (route.params?.autoValidate) {
      initiateGoToNextScreen && initiateGoToNextScreen()
    }
  }, [route.params?.autoValidate, initiateGoToNextScreen])

  useEffect(() => {
    // If we scan a QR code encoded with a payment url for a specific user e.g. https://{domain}/{username}
    // then we want to detect the username as the destination
    if (route.params?.username) {
      handleChangeText(route.params?.username)
    }
  }, [route.params?.username, handleChangeText])

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
    <Screen
      preset="scroll"
      style={styles.screenStyle}
      keyboardOffset="navigationHeader"
      keyboardShouldPersistTaps="handled"
    >
      <ConfirmDestinationModal
        destinationState={destinationState}
        dispatchDestinationStateAction={dispatchDestinationStateAction}
      />
      <View style={styles.sendBitcoinDestinationContainer}>
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
                  LL,
                })
              }
            }}
          >
            <View style={styles.iconContainer}>
              {/* we could Paste from "FontAwesome" but as svg*/}
              <Icon name="ios-clipboard-outline" color={colors.primary} size={22} />
            </View>
          </TouchableWithoutFeedback>
        </View>
        <DestinationInformation destinationState={destinationState} />
        <View style={styles.buttonContainer}>
          <GaloyPrimaryButton
            title={
              destinationState.unparsedDestination
                ? LL.common.next()
                : LL.SendBitcoinScreen.destinationIsRequired()
            }
            loading={destinationState.destinationState === "validating"}
            disabled={
              destinationState.destinationState === "invalid" ||
              !destinationState.unparsedDestination ||
              !initiateGoToNextScreen
            }
            onPress={initiateGoToNextScreen || undefined}
          />
        </View>
      </View>
    </Screen>
  )
}

export default SendBitcoinDestinationScreen

const usestyles = makeStyles(({ colors }) => ({
  screenStyle: {
    padding: 20,
    flexGrow: 1,
  },
  sendBitcoinDestinationContainer: {
    flex: 1,
  },
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
  buttonContainer: {
    flex: 1,
    justifyContent: "flex-end",
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
