import React, { useState } from "react"
import { palette } from "@app/theme"
import { StyleSheet, Text, TextInput, View } from "react-native"
import {
  parsePaymentDestination,
  useDelayedQuery,
  translateUnknown as translate,
} from "@galoymoney/client"
import { Button } from "react-native-elements"
import ScanIcon from "@app/assets/icons/scan.svg"
import { TouchableWithoutFeedback } from "react-native-gesture-handler"
import useMainQuery from "@app/hooks/use-main-query"
import { useMySubscription } from "@app/hooks"
import useToken from "@app/utils/use-token"

const Styles = StyleSheet.create({
  inputContainer: {
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
  descriptionContainer: {
    flex: 4,
  },
  buttonContainer: {
    flex: 1,
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
  errorContainer: {
    flex: 1,
  },
  errorText: {
    color: palette.red,
    textAlign: "center",
  },
})

const SendBitcoinDestination = ({
  destination,
  setDestination,
  nextStep,
  navigation,
}) => {
  const { myPubKey, username: myUsername } = useMainQuery()
  const { convertCurrencyAmount } = useMySubscription()
  const [error, setError] = useState<string | undefined>(undefined)
  const { tokenNetwork } = useToken()

  const [userDefaultWalletIdQuery, { loading: userDefaultWalletIdLoading }] =
    useDelayedQuery.userDefaultWalletId()

  const validateDestination = React.useCallback(async () => {
    setError(undefined)
    setDestination(destination)

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
      // staticLnurlIdentifier,
    } = parsePaymentDestination({ destination, network: tokenNetwork, pubKey: myPubKey })

    if (destination === myUsername) {
      setError(translate("You can't send a payment to yourself"))

      return { valid: false }
    }

    const fixedAmount = amountInvoice !== undefined

    const staticLnurlIdentifier = false // FIXME: Change galoy-client to return this

    let recipientWalletId, note, defaultAmount

    if (valid) {
      if (paymentType === "onchain") setDestination(address)
      if (paymentType === "lightning") setDestination(paymentRequest)

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
        setDestination(handle)
        recipientWalletId = data?.userDefaultWalletId
      }

      //   if (lnurl) {
      //     setPaymentType("lnurl")
      //     if (staticLnurlIdentifier) {
      //       setIsStaticLnurlIdentifier(true)
      //       setInteractive(true)
      //     }
      //     if (route.params?.lnurlParams) {
      //       const params = setLnurlParams({ params: route.params.lnurlParams, lnurl })
      //       setLnurlPay({ ...params })
      //     } else {
      //       debouncedGetLnurlParams(lnurl)
      //     }
      //   }

      if (fixedAmount && !staticLnurlIdentifier) {
        defaultAmount = convertCurrencyAmount({
          from: "BTC",
          to: "USD",
          amount: amountInvoice,
        })
      }

      if (memoInvoice) {
        note = memoInvoice.toString()
      }
    } else {
      setError(translate(errorMessage || "Invalid Payment Destination"))
    }

    return {
      valid,
      paymentType,
      sameNode,
      fixedAmount,
      defaultAmount,
      note,
      recipientWalletId,
    }
  }, [
    convertCurrencyAmount,
    destination,
    myPubKey,
    myUsername,
    setDestination,
    tokenNetwork,
    userDefaultWalletIdLoading,
    userDefaultWalletIdQuery,
  ])

  const handleChangeText = (newDestination) => {
    setError(undefined)
    setDestination(newDestination)
  }

  const handlePress = async () => {
    const parsedDestination = await validateDestination()
    if (parsedDestination.valid) {
      return nextStep(parsedDestination)
    }
  }

  return (
    <>
      <Text style={Styles.fieldTitleText}>
        {translate("SendBitcoinScreen.destination")}
      </Text>
      <View style={Styles.fieldBackground}>
        <TextInput
          style={Styles.input}
          placeholder={translate("SendBitcoinScreen.input")}
          onChangeText={handleChangeText}
          value={destination}
          selectTextOnFocus
          autoCapitalize="none"
        />
        <TouchableWithoutFeedback onPress={() => navigation?.navigate("scanningQRCode")}>
          <View style={Styles.iconContainer}>
            <ScanIcon />
          </View>
        </TouchableWithoutFeedback>
      </View>

      <View style={Styles.descriptionContainer}></View>

      {error && (
        <View style={Styles.errorContainer}>
          <Text style={Styles.errorText}>{error}</Text>
        </View>
      )}

      <View style={Styles.buttonContainer}>
        <Button
          title={
            destination
              ? translate("common.next")
              : translate("SendBitcoinScreen.destinationIsRequired")
          }
          buttonStyle={[Styles.button, Styles.activeButtonStyle]}
          titleStyle={Styles.activeButtonTitleStyle}
          disabledStyle={[Styles.button, Styles.disabledButtonStyle]}
          disabledTitleStyle={Styles.disabledButtonTitleStyle}
          disabled={Boolean(!destination || error)}
          onPress={handlePress}
        />
      </View>
    </>
  )
}

export default SendBitcoinDestination
