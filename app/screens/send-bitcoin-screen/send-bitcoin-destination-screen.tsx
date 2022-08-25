import useMainQuery from "@app/hooks/use-main-query"
import React, { useEffect, useState } from "react"
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
  parsePaymentDestination,
  useDelayedQuery,
} from "@galoymoney/client"
import { StackScreenProps } from "@react-navigation/stack"
import { RootStackParamList } from "@app/navigation/stack-param-lists"
import useToken from "@app/hooks/use-token"
import { PaymentAmount, WalletCurrency } from "@app/types/amounts"
import { Button } from "react-native-elements"
import ScanIcon from "@app/assets/icons/scan.svg"
import { useI18nContext } from "@app/i18n/i18n-react"


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

const domains = [
  "https://ln.bitcoinbeach.com/",
  "https://pay.mainnet.galoy.io/",
  "https://pay.bbw.sv/",
]

const lnurlDomains = ["ln.bitcoinbeach.com", "pay.bbw.sv"]

const SendBitcoinDestinationScreen = ({
  navigation,
  route,
}: StackScreenProps<RootStackParamList, "sendBitcoinDestination">) => {
  const [destination, setDestination] = useState("")
  const { myPubKey, username: myUsername } = useMainQuery()
  const [error, setError] = useState<string | undefined>(undefined)
  const { tokenNetwork } = useToken()
  const { LL } = useI18nContext()

  const [userDefaultWalletIdQuery, { loading: userDefaultWalletIdLoading }] =
    useDelayedQuery.userDefaultWalletId()

  const validateDestination = React.useCallback(
    async (destination) => {
      setError(undefined)

      const {
        valid,
        errorMessage,

        paymentType,
        address,
        paymentRequest,
        handle,

        amount: amountInvoice,
        memo: memoInvoice,
        sameNode,
      } = parsePaymentDestination({
        destination,
        network: tokenNetwork,
        pubKey: myPubKey,
      })
      let isSameNode = sameNode
      let lnurlParams

      if (destination === myUsername) {
        setError(LL.SendBitcoinScreen.youCantSendAPaymentToYourself())

        return { valid: false }
      }

      let recipientWalletId, note, parsedDestination

      if (valid) {
        if (paymentType === "onchain") parsedDestination = address
        if (paymentType === "lightning") parsedDestination = paymentRequest

        if (paymentType === "intraledger") {
          if (userDefaultWalletIdLoading) {
            return { valid: false }
          }

          const { data, errorsMessage } = await userDefaultWalletIdQuery({
            username: handle,
          })

          if (errorsMessage) {
            setError(errorsMessage)
            return { valid: false }
          }
          parsedDestination = handle
          recipientWalletId = data?.userDefaultWalletId
        }

        if (paymentType === "lnurl") {
          try {
            lnurlParams = await fetchLnurlPaymentParams({ lnUrlOrAddress: destination })
          } catch (error) {
            setError(LL.SendBitcoinScreen.failedToFetchLnurlParams())
            return { valid: false }
          }
          isSameNode = lnurlDomains.some((domain) => lnurlParams?.domain.includes(domain))
          parsedDestination = destination
        }

        if (memoInvoice) {
          note = memoInvoice.toString()
        }
      } else {
        setError(errorMessage || "Invalid Payment Destination")
      }

      return {
        valid,
        paymentType,
        sameNode: isSameNode,
        destination: parsedDestination,
        fixedAmount:
          amountInvoice &&
          ({
            amount: amountInvoice,
            currency: WalletCurrency.BTC,
          } as PaymentAmount<WalletCurrency.BTC>),
        note,
        recipientWalletId,
        lnurlParams,
      }
    },
    [
      myPubKey,
      myUsername,
      tokenNetwork,
      userDefaultWalletIdLoading,
      userDefaultWalletIdQuery,
    ],
  )

  const handleChangeText = (newDestination) => {
    setError(undefined)
    setDestination(newDestination)
  }

  const goToNextScreen = async () => {
    const parsedDestination = await validateDestination(destination)

    if (parsedDestination.valid) {
      return navigation.navigate("sendBitcoinDetails", {
        fixedAmount: parsedDestination.fixedAmount,
        destination: parsedDestination.destination,
        note: parsedDestination.note,
        recipientWalletId: parsedDestination.recipientWalletId,
        lnurl: parsedDestination.lnurlParams,
        sameNode: parsedDestination.sameNode,
        paymentType: parsedDestination.paymentType,
      })
    }
  }

  useEffect(() => {
    // If we scan a QR code encoded with a payment url for a specific user e.g. https://{domain}/{username}
    // then we want to detect the username as the destination
    if (route.params?.payment) {
      if (route.params.payment.startsWith("https://")) {
        domains.forEach((domain) => {
          if (route.params?.payment?.startsWith(domain)) {
            setDestination(route.params?.payment?.substring(domain.length))
          }
        })
      } else {
        setDestination(route.params?.payment)
      }
    }
  }, [route.params?.payment])

  useEffect(() => {
    if (route.params?.username) {
      setDestination(route.params?.username)
    }
  }, [route.params?.username])

  return (
    <ScrollView
      showsVerticalScrollIndicator={false}
      style={Styles.scrollView}
      contentContainerStyle={Styles.contentContainer}
    >
      <View style={Styles.sendBitcoinDestinationContainer}>
        <Text style={Styles.fieldTitleText}>
          {LL.SendBitcoinScreen.destination()}
        </Text>

        <View style={Styles.fieldBackground}>
          <TextInput
            style={Styles.input}
            placeholder={LL.SendBitcoinScreen.input()}
            onChangeText={handleChangeText}
            value={destination}
            selectTextOnFocus
            autoCapitalize="none"
            autoCorrect={false}
          />
          <TouchableWithoutFeedback onPress={() => navigation.navigate("scanningQRCode")}>
            <View style={Styles.iconContainer}>
              <ScanIcon />
            </View>
          </TouchableWithoutFeedback>
        </View>

        {error && (
          <View style={Styles.errorContainer}>
            <Text style={Styles.errorText}>{error}</Text>
          </View>
        )}

        <View style={Styles.buttonContainer}>
          <Button
            title={
              destination
                ? LL.common.next()
                : LL.SendBitcoinScreen.destinationIsRequired()
            }
            buttonStyle={[Styles.button, Styles.activeButtonStyle]}
            titleStyle={Styles.activeButtonTitleStyle}
            disabledStyle={[Styles.button, Styles.disabledButtonStyle]}
            disabledTitleStyle={Styles.disabledButtonTitleStyle}
            disabled={Boolean(!destination || error)}
            onPress={goToNextScreen}
          />
        </View>
      </View>
    </ScrollView>
  )
}

export default SendBitcoinDestinationScreen
