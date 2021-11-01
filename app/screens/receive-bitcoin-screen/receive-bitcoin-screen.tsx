import { gql, useApolloClient, useLazyQuery, useMutation, useQuery, useSubscription } from "@apollo/client"
import messaging from "@react-native-firebase/messaging"
import { StackNavigationProp } from "@react-navigation/stack"
import * as React from "react"
import { useCallback, useMemo, useEffect, useState } from "react"
import {
  Alert,
  AppState,
  AppStateStatus,
  Keyboard,
  Platform,
  ScrollView,
  TextInput,
  View,
} from "react-native"
import EStyleSheet from "react-native-extended-stylesheet"
import ReactNativeHapticFeedback from "react-native-haptic-feedback"
import ScreenBrightness from "react-native-screen-brightness"
import Swiper from "react-native-swiper"
import Icon from "react-native-vector-icons/Ionicons"
import debounce from "lodash.debounce"

import { GaloyInput } from "../../components/galoy-input"
import { InputPayment } from "../../components/input-payment"
import { Screen } from "../../components/screen"
import { translate } from "../../i18n"
import { MoveMoneyStackParamList } from "../../navigation/stack-param-lists"
import { palette } from "../../theme/palette"
import { ScreenType } from "../../types/jsx"
import { getHashFromInvoice } from "../../utils/bolt11"
import { isIos } from "../../utils/helper"
import { hasFullPermissions, requestPermission } from "../../utils/notifications"
import { QRView } from "./qr-view"
import { useMoneyAmount } from "../../hooks"
import { TextCurrency } from "../../components/text-currency"
import { useCurrencies } from "../../hooks/currency-hooks"
import useToken from "../../utils/use-token"
import { MAIN_QUERY } from "../../graphql/query"
import { Button, Text } from "react-native-elements"

// FIXME: crash when no connection


type OperationError = {
  message: string
}

const styles = EStyleSheet.create({
  screen: {
    // FIXME: doesn't work for some reason
    // justifyContent: "space-around"
  },

  section: {
    flex: 1,
    paddingHorizontal: 50
  },

  subCurrencyText: {
    color: palette.midGrey,
    fontSize: "16rem",
    marginRight: "10%",
    marginTop: 0,
    paddingTop: 0,
    textAlign: "center",
    width: "90%",
  },

  textStyle: {
    color: palette.darkGrey,
    fontSize: "18rem",
    textAlign: "center",
  },
  buttonContainer: { marginHorizontal: 52, paddingVertical: 18 },

  buttonStyle: {
    backgroundColor: palette.lightBlue,
    borderRadius: 32,
  },

  buttonTitle: {
    fontWeight: "bold",
    color: "white"
  },
})

const ADD_NO_AMOUNT_INVOICE = gql`
mutation lnNoAmountInvoiceCreate($input: LnNoAmountInvoiceCreateInput!){
  lnNoAmountInvoiceCreate(input: $input){
    errors {
      message
    }
    invoice {
      paymentRequest
      paymentHash
     }
  }
}
`

const ADD_INVOICE = gql`
mutation lnInvoiceCreate($input: LnInvoiceCreateInput!){
  lnInvoiceCreate(input: $input){
    errors {
      message
    }
    invoice {
      paymentRequest
      paymentHash
     }
  }
}
`

const LN_INVOICE_PAYMENT_STATUS = gql`
  subscription lnInvoicePaymentStatus($input: LnInvoicePaymentStatusInput!) {
    mutationData: lnInvoicePaymentStatus(input: $input) {
      errors {
        message
      }
      status
    }
  }
`

const GET_ONCHAIN_ADDRESS = gql`
mutation onChainAddressCurrent($input: OnChainAddressCurrentInput!) {
  onChainAddressCurrent(input: $input) {
    errors{
      message
    }
    address
  }
}
`

type Props = {
  navigation: StackNavigationProp<MoveMoneyStackParamList, "receiveBitcoin">
}

export const ReceiveBitcoinScreen: ScreenType = ({ navigation }: Props) => {
  const client = useApolloClient()
  const { hasToken } = useToken()

  const { primaryCurrency, secondaryCurrency, toggleCurrency } = useCurrencies()

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const [primaryAmount, _, setPrimaryAmount, setPrimaryAmountValue] =
    useMoneyAmount(primaryCurrency)

  const [secondaryAmount, convertSecondaryAmount, setSecondaryAmount] =
    useMoneyAmount(secondaryCurrency)

  const satAmount =
    primaryCurrency === "BTC" ? primaryAmount.value : secondaryAmount.value

  const [addNoAmountInvoice] = useMutation(ADD_NO_AMOUNT_INVOICE)
  const [addInvoice] = useMutation(ADD_INVOICE)
  const [getOnchainAddress] = useMutation(GET_ONCHAIN_ADDRESS)
  const [lastOnChainAddress, setLastOnChainAddress] = useState<string>()
  const [btcAddressRequested, setBtcAddressRequested] = useState<Boolean>(false)
  const {
    loading: loadingMain,
    error,
    data,
    refetch,
  } = useQuery(MAIN_QUERY, {
    variables: { hasToken },
    notifyOnNetworkStatusChange: true,
    errorPolicy: "all",
  })
  
  const onBtcAddressRequestClick = (async () => {
    try {
      setLoading(true)
      const defaultWalletId: string = data?.me?.defaultAccount?.wallets?.find(wallet => wallet?.__typename === "BTCWallet")?.id
      const { data: { onChainAddressCurrent: { address } } } = await getOnchainAddress({
        variables: { input: { walletId: defaultWalletId } }
      })
      setLastOnChainAddress(address)
      setBtcAddressRequested(true)
    } catch (err) {
      console.log(err)
      setLastOnChainAddress("issue with the QRcode")
    }
    finally {
      setLoading(false)
    }
  })


  const [memo, setMemo] = useState("")
  const [loading, setLoading] = useState(true)
  const [invoice, setInvoice] = useState("")
  const [err, setErr] = useState("")
  const [isSucceed, setIsSucceed] = useState(false)
  const [brightnessInitial, setBrightnessInitial] = useState(null)
  console.log("invoice:")
  console.log(invoice)
  const { loading: loadingFetchInvoiceStatus, error: errorFetchInvoiceStatus, data: fetchInvoiceStatusData } = useSubscription<{
    mutationData: {
      errors: OperationError[]
      status?: string
    }
  }>(LN_INVOICE_PAYMENT_STATUS, {
    variables: {
      input: {
        invoice,
      },
    },
  })
  const updateInvoice = useMemo(
    () =>
      debounce(async ({ satAmount, memo }) => {
        setLoading(true)
        try {
          if (satAmount === 0) {
            const { data: { lnNoAmountInvoiceCreate: { invoice, errors } } } = await addNoAmountInvoice({
              variables: { input: { memo: memo } },
            })
            if (errors && errors.length !== 0) {
              console.error(errors, "error with lnNoAmountInvoiceCreate")
              setErr(translate("ReceiveBitcoinScreen.error"))
              return
            }
            setInvoice(invoice.paymentRequest)
          } else {
            const { data: { lnInvoiceCreate: { invoice, errors } } } = await addInvoice({
              variables: { input: { amount: satAmount, memo: memo } }
            })
            if (errors && errors.length !== 0) {
              console.error(errors, "error with lnInvoiceCreate")
              setErr(translate("ReceiveBitcoinScreen.error"))
              return
            }
            setInvoice(invoice.paymentRequest)
          }

        } catch (err) {
          console.error(err, "error with AddInvoice")
          setErr(`${err}`)
          throw err
        } finally {
          setLoading(false)
        }
      }, 750),
    [satAmount],
  )

  useEffect(() => {
    console.log("status data")
    console.log(fetchInvoiceStatusData)
  }, [fetchInvoiceStatusData])

  useEffect(() => {
    if (primaryCurrency !== primaryAmount.currency) {
      const tempAmount = { ...secondaryAmount }
      setSecondaryAmount(primaryAmount)
      setPrimaryAmount(tempAmount)
    }
  }, [
    primaryAmount,
    primaryCurrency,
    secondaryAmount,
    setPrimaryAmount,
    setSecondaryAmount,
  ])

  useEffect(() => {
    updateInvoice({ satAmount, memo })
  }, [satAmount, memo, updateInvoice])

  useEffect(() => {
    const fn = async () => {
      // android required permission, and open the settings page for it
      // it's probably not worth the hurdle
      //
      // only doing the brightness for iOS for now
      //
      // only need     <uses-permission android:name="android.permission.WRITE_SETTINGS" tools:ignore="ProtectedPermissions"/>
      // in the manifest
      // see: https://github.com/robinpowered/react-native-screen-brightness/issues/38
      //
      if (!isIos) {
        return
      }

      // let hasPerm = await ScreenBrightness.hasPermission();

      // if(!hasPerm){
      //   ScreenBrightness.requestPermission();
      // }

      // only enter this loop when brightnessInitial is not set
      // if (!brightnessInitial && hasPerm) {
      if (!brightnessInitial) {
        ScreenBrightness.getBrightness().then((brightness: number) => {
          setBrightnessInitial(brightness)
          ScreenBrightness.setBrightness(1) // between 0 and 1
        })
      }
    }

    fn()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  useEffect(
    () =>
      brightnessInitial
        ? () => ScreenBrightness.setBrightness(brightnessInitial)
        : () => null,
    [brightnessInitial],
  )

  useEffect(() => {
    const notifRequest = async () => {
      const waitUntilAuthorizationWindow = 5000

      if (Platform.OS === "ios") {
        if (await hasFullPermissions()) {
          return
        }

        setTimeout(
          () =>
            Alert.alert(
              translate("common.notification"),
              translate("ReceiveBitcoinScreen.activateNotifications"),
              [
                {
                  text: translate("common.later"),
                  // todo: add analytics
                  onPress: () => console.log("Cancel/Later Pressed"),
                  style: "cancel",
                },
                {
                  text: translate("common.ok"),
                  onPress: () => hasToken && requestPermission(client),
                },
              ],
              { cancelable: true },
            ),
          waitUntilAuthorizationWindow,
        )
      }
    }

    notifRequest()
  }, [client, hasToken])

  useEffect(() => {
    // Update secondary amount when price updates
    convertSecondaryAmount(primaryAmount)
  }, [primaryAmount, convertSecondaryAmount])

  const paymentSuccess = useCallback(() => {
    // success

    const options = {
      enableVibrateFallback: true,
      ignoreAndroidSystemSettings: false,
    }

    ReactNativeHapticFeedback.trigger("notificationSuccess", options)

    setIsSucceed(true)

    // Alert.alert("success", translate("ReceiveBitcoinScreen.invoicePaid"), [
    //   {
    //     text: translate("common.ok"),
    //     onPress: () => {
    //       navigation.goBack(false)
    //     },
    //   },
    // ])
  }, [])





  const inputMemoRef = React.useRef<TextInput>()

  useEffect(() => {
    const subscription = Keyboard.addListener("keyboardDidHide", _keyboardDidHide)
    return () => subscription.remove()
  })

  const _keyboardDidHide = useCallback(() => {
    inputMemoRef?.current?.blur()
  }, [inputMemoRef])

  return (
    <Screen backgroundColor={palette.lighterGrey} style={styles.screen} preset="fixed">
      <ScrollView keyboardShouldPersistTaps="always">
        <View style={styles.section}>
          <InputPayment
            editable={!isSucceed}
            forceKeyboard={false}
            toggleCurrency={toggleCurrency}
            onUpdateAmount={setPrimaryAmountValue}
            primaryAmount={primaryAmount}
            secondaryAmount={secondaryAmount}
            sub
          />
          <TextCurrency
            amount={secondaryAmount.value}
            currency={secondaryAmount.currency}
            style={styles.subCurrencyText}
          />
          <GaloyInput
            placeholder={translate("ReceiveBitcoinScreen.setNote")}
            value={memo}
            onChangeText={setMemo}
            // eslint-disable-next-line react-native/no-inline-styles
            containerStyle={{ marginTop: 0 }}
            inputStyle={styles.textStyle}
            leftIcon={
              <Icon name="ios-create-outline" size={21} color={palette.darkGrey} />
            }
            ref={inputMemoRef}
            disabled={isSucceed}
          />
        </View>
        {/* FIXME: fixed height */}

        <Swiper height={450} loop={false} index={btcAddressRequested ? 1 : 0}>
          <QRView
            data={invoice}
            type="lightning"
            amount={satAmount}
            memo={memo}
            loading={loading}
            isSucceed={isSucceed}
            navigation={navigation}
            err={err}
          />
          {btcAddressRequested && lastOnChainAddress && <QRView
            data={lastOnChainAddress}
            type="bitcoin"
            amount={satAmount}
            memo={memo}
            loading={loading}
            isSucceed={isSucceed}
            navigation={navigation}
            err={err}
          />}
          {!btcAddressRequested && !lastOnChainAddress && <Text style={{ alignSelf: "center", marginHorizontal: 52 }}><Button
            buttonStyle={styles.buttonStyle}
            containerStyle={styles.buttonContainer}
            title={"Generate BTC Address"}
            onPress={onBtcAddressRequestClick}
            titleStyle={styles.buttonTitle}
          /></Text>}
        </Swiper>
      </ScrollView>
    </Screen>
  )
}
