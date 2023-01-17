import React, { useCallback, useEffect, useMemo } from "react"
import {
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableWithoutFeedback,
  View,
} from "react-native"
import { palette } from "@app/theme"
import {
  fetchLnurlPaymentParams,
  parsingv2,
  Network as NetworkLibGaloy,
} from "@galoymoney/client"
import { StackScreenProps } from "@react-navigation/stack"
import { RootStackParamList } from "@app/navigation/stack-param-lists"
import { BtcPaymentAmount } from "@app/types/amounts"
import { Button } from "@rneui/base"
import ScanIcon from "@app/assets/icons/scan.svg"
import { useI18nContext } from "@app/i18n/i18n-react"
import {
  InvalidDestinationReason,
  useSendBitcoinDestinationReducer,
  ValidPaymentDestination,
} from "./send-bitcoin-reducer"
import { ConfirmDestinationModal } from "./confirm-destination-modal"
import { DestinationInformation } from "./destination-information"
import {
  PaymentType,
  InvalidLightningDestinationReason,
  InvalidOnchainDestinationReason,
} from "@galoymoney/client/dist/parsing-v2"
import { logPaymentDestinationAccepted } from "@app/utils/analytics"
import { testProps } from "../../../utils/testProps"
import Paste from "react-native-vector-icons/FontAwesome"
import Clipboard from "@react-native-community/clipboard"
import crashlytics from "@react-native-firebase/crashlytics"
import { toastShow } from "@app/utils/toast"
import {
  WalletCurrency,
  useSendBitcoinDestinationQuery,
  useUserDefaultWalletIdLazyQuery,
} from "@app/graphql/generated"
import { gql } from "@apollo/client"

const Styles = StyleSheet.create({
  scrollView: {
    flexDirection: "column",
    padding: 20,
    flex: 6,
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

const parsePaymentDestination = parsingv2.parsePaymentDestination

// FIXME this should come from globals.lightningAddressDomainAliases
export const lnurlDomains = ["ln.bitcoinbeach.com", "pay.bbw.sv"]

type UsernameStatus = "paid-before" | "never-paid" | "does-not-exist" | "self"

const minimumValidationDuration = 500
const wait = (ms: number) => {
  return new Promise((resolve) => {
    setTimeout(resolve, ms)
  })
}
async function withMinimumDuration<T>(
  promise: Promise<T> | T,
  duration?: number,
): Promise<T> {
  return (await Promise.all([promise, wait(duration || minimumValidationDuration)]))[0]
}

type GetUsernameStatusParams = {
  username: string
  contacts: string[]
  myUsername: string
  getWalletIdForUsername: (username: string) => Promise<string | undefined>
}

const getUsernameStatus = async ({
  username,
  contacts,
  myUsername,
  getWalletIdForUsername,
}: GetUsernameStatusParams): Promise<{
  usernameStatus: UsernameStatus
  walletId?: string
}> => {
  if (username.toLowerCase() === myUsername?.toLowerCase()) {
    return { usernameStatus: "self" }
  }

  const walletId = await getWalletIdForUsername(username)
  if (
    walletId &&
    contacts.map((contact) => contact.toLowerCase()).includes(username.toLowerCase())
  ) {
    return { usernameStatus: "paid-before", walletId }
  } else if (walletId) {
    return { usernameStatus: "never-paid", walletId }
  }
  return { usernameStatus: "does-not-exist" }
}

const sendBitcoinDetailsScreenParams = (destination: ValidPaymentDestination) => {
  switch (destination.paymentType) {
    case PaymentType.Lightning:
      return {
        destination: destination.paymentRequest,
        fixedAmount:
          destination.amount &&
          ({
            amount: destination.amount,
            currency: WalletCurrency.Btc,
          } as BtcPaymentAmount),
        paymentType: PaymentType.Lightning,
        note: destination.memo,
      }
    case PaymentType.Intraledger:
      return {
        destination: destination.handle,
        recipientWalletId: destination.walletId,
        paymentType: PaymentType.Intraledger,
      }
    case PaymentType.Lnurl:
      return {
        destination: destination.lnurl,
        paymentType: PaymentType.Lnurl,
        lnurl: destination.lnurlParams,
      }
    case PaymentType.Onchain:
      return {
        destination: destination.address,
        fixedAmount:
          destination.amount &&
          ({
            amount: destination.amount,
            currency: WalletCurrency.Btc,
          } as BtcPaymentAmount),
        note: destination.memo,
        paymentType: PaymentType.Onchain,
      }
  }
}

gql`
  query sendBitcoinDestination {
    globals {
      network
    }
    me {
      username
      contacts {
        id
        username
        alias
        transactionsCount
      }
    }
  }

  # TODO replace with AccountDefaultWallet?
  query userDefaultWalletId($username: Username!) {
    userDefaultWalletId(username: $username)
  }
`

const SendBitcoinDestinationScreen = ({
  navigation,
  route,
}: StackScreenProps<RootStackParamList, "sendBitcoinDestination">) => {
  const [destinationState, dispatchDestinationStateAction] =
    useSendBitcoinDestinationReducer()
  const [goToNextScreenWhenValid, setGoToNextScreenWhenValid] = React.useState(false)

  const { data } = useSendBitcoinDestinationQuery({
    fetchPolicy: "cache-only",
    returnPartialData: true,
  })
  const myUsername = data?.me?.username
  const bitcoinNetwork = data?.globals?.network
  const contacts = useMemo(() => data?.me?.contacts ?? [], [data?.me?.contacts])

  const { LL } = useI18nContext()
  const [userDefaultWalletIdQuery] = useUserDefaultWalletIdLazyQuery()

  const checkUsername:
    | ((
        username: string,
      ) => Promise<{ usernameStatus: UsernameStatus; walletId?: string }>)
    | null = useMemo(() => {
    if (!contacts) {
      return null
    }
    const lowercaseContacts = contacts.map((contact) => contact.username.toLowerCase())
    const lowercaseMyUsername = myUsername ? myUsername.toLowerCase() : ""
    const getWalletIdForUsername = async (username: string) => {
      const { data } = await userDefaultWalletIdQuery({ variables: { username } })
      return data?.userDefaultWalletId
    }
    return async (username: string) =>
      getUsernameStatus({
        username,
        contacts: lowercaseContacts,
        myUsername: lowercaseMyUsername,
        getWalletIdForUsername,
      })
  }, [contacts, userDefaultWalletIdQuery, myUsername])

  const validateDestination = React.useCallback(
    async (destination: string) => {
      if (destinationState.destinationState !== "entering") {
        return
      }

      const parsedPaymentDestination = parsePaymentDestination({
        destination,
        network: bitcoinNetwork as NetworkLibGaloy,
        lnAddressDomains: lnurlDomains,
      })

      dispatchDestinationStateAction({
        type: "set-validating",
        payload: {
          parsedDestination: parsedPaymentDestination,
          unparsedDestination: destination,
        },
      })

      switch (parsedPaymentDestination.paymentType) {
        case PaymentType.Unknown: {
          await wait(minimumValidationDuration)
          return dispatchDestinationStateAction({
            type: "set-invalid",
            payload: {
              invalidDestinationReason: "unknown-destination",
              unparsedDestination: destination,
            },
          })
        }
        case PaymentType.Lnurl: {
          if (parsedPaymentDestination.valid) {
            try {
              const lnurlParams = await withMinimumDuration(
                fetchLnurlPaymentParams({ lnUrlOrAddress: destination }),
              )
              return dispatchDestinationStateAction({
                type: "set-valid",
                payload: {
                  validDestination: { ...parsedPaymentDestination, lnurlParams },
                  unparsedDestination: destination,
                },
              })
            } catch (err) {
              crashlytics().recordError(err)
            }
          }
          await wait(minimumValidationDuration)
          return dispatchDestinationStateAction({
            type: "set-invalid",
            payload: {
              invalidDestinationReason: "lnurl-error",
              unparsedDestination: destination,
            },
          })
        }
        case PaymentType.Intraledger: {
          const usernameInfo = await withMinimumDuration(
            checkUsername(parsedPaymentDestination.handle),
          )
          switch (usernameInfo.usernameStatus) {
            case "paid-before":
              return dispatchDestinationStateAction({
                type: "set-valid",
                payload: {
                  validDestination: {
                    ...parsedPaymentDestination,
                    valid: true,
                    walletId: usernameInfo.walletId,
                  },
                  unparsedDestination: destination,
                },
              })
            case "never-paid":
              return dispatchDestinationStateAction({
                type: "set-requires-confirmation",
                payload: {
                  confirmationType: {
                    type: "new-username",
                    username: parsedPaymentDestination.handle,
                  },
                  validDestination: {
                    ...parsedPaymentDestination,
                    valid: true,
                    walletId: usernameInfo.walletId,
                  },
                  unparsedDestination: destination,
                },
              })
            case "does-not-exist":
              return dispatchDestinationStateAction({
                type: "set-invalid",
                payload: {
                  invalidDestinationReason: "username-does-not-exist",
                  unparsedDestination: destination,
                },
              })
            case "self":
              return dispatchDestinationStateAction({
                type: "set-invalid",
                payload: {
                  invalidDestinationReason: "self-payment",
                  unparsedDestination: destination,
                },
              })
          }
          break
        }
        case PaymentType.Lightning: {
          await wait(minimumValidationDuration)
          if (parsedPaymentDestination.valid === true) {
            return dispatchDestinationStateAction({
              type: "set-valid",
              payload: {
                validDestination: parsedPaymentDestination,
                unparsedDestination: destination,
              },
            })
          }

          let invalidDestinationReason: InvalidDestinationReason
          switch (parsedPaymentDestination.invalidReason) {
            case InvalidLightningDestinationReason.InvoiceExpired:
              invalidDestinationReason = "expired-invoice"
              break
            case InvalidLightningDestinationReason.WrongNetwork:
              invalidDestinationReason = "wrong-network"
              break
            case InvalidLightningDestinationReason.Unknown:
              invalidDestinationReason = "unknown-destination"
              break
          }

          return dispatchDestinationStateAction({
            type: "set-invalid",
            payload: { invalidDestinationReason, unparsedDestination: destination },
          })
        }
        case PaymentType.Onchain: {
          await wait(minimumValidationDuration)
          if (parsedPaymentDestination.valid === true) {
            return dispatchDestinationStateAction({
              type: "set-valid",
              payload: {
                validDestination: parsedPaymentDestination,
                unparsedDestination: destination,
              },
            })
          }
          let invalidOnchainDestinationReason: InvalidDestinationReason
          switch (parsedPaymentDestination.invalidReason) {
            case InvalidOnchainDestinationReason.InvalidAmount:
              invalidOnchainDestinationReason = "invalid-amount"
              break
            case InvalidOnchainDestinationReason.WrongNetwork:
              invalidOnchainDestinationReason = "wrong-network"
              break
            case InvalidOnchainDestinationReason.Unknown:
              invalidOnchainDestinationReason = "unknown-onchain"
          }
          return dispatchDestinationStateAction({
            type: "set-invalid",
            payload: {
              invalidDestinationReason: invalidOnchainDestinationReason,
              unparsedDestination: destination,
            },
          })
        }
      }
    },
    [
      bitcoinNetwork,
      checkUsername,
      destinationState.destinationState,
      dispatchDestinationStateAction,
    ],
  )

  const handleChangeText = useCallback(
    (newDestination) => {
      dispatchDestinationStateAction({
        type: "set-unparsed-destination",
        payload: { unparsedDestination: newDestination },
      })
      setGoToNextScreenWhenValid(false)
    },
    [dispatchDestinationStateAction, setGoToNextScreenWhenValid],
  )

  useEffect(() => {
    if (goToNextScreenWhenValid && destinationState.destinationState === "valid") {
      // go to next screen
      logPaymentDestinationAccepted(destinationState.destination.paymentType)
      setGoToNextScreenWhenValid(false)
      return navigation.navigate(
        "sendBitcoinDetails",
        sendBitcoinDetailsScreenParams(destinationState.destination),
      )
    }
  }, [destinationState, goToNextScreenWhenValid, navigation, setGoToNextScreenWhenValid])

  const initiateGoToNextScreen = async () => {
    validateDestination(destinationState.unparsedDestination)
    setGoToNextScreenWhenValid(true)
  }

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
    <ScrollView
      showsVerticalScrollIndicator={false}
      style={Styles.scrollView}
      contentContainerStyle={Styles.contentContainer}
      keyboardShouldPersistTaps="always"
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
            onPress={() => {
              try {
                Clipboard.getString().then(async (clipboard) => {
                  dispatchDestinationStateAction({
                    type: "set-unparsed-destination",
                    payload: {
                      unparsedDestination: clipboard,
                    },
                  })
                  await validateDestination(clipboard)
                })
              } catch (err) {
                crashlytics().recordError(err)
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
              destinationState.destinationState === "invalid"
            }
            onPress={initiateGoToNextScreen}
          />
        </View>
      </View>
    </ScrollView>
  )
}

export default SendBitcoinDestinationScreen
