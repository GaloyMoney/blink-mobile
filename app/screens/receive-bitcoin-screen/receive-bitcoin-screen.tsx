import { gql, useApolloClient, useMutation } from "@apollo/client"
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
import { useCurrencies } from "../../hooks/use-currencies"

// FIXME: crash when no connection

const styles = EStyleSheet.create({
  screen: {
    // FIXME: doesn't work for some reason
    // justifyContent: "space-around"
  },

  section: {
    flex: 1,
    paddingHorizontal: 50,
    width: "100%",
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
})

const ADD_INVOICE = gql`
  mutation addInvoice($value: Int, $memo: String) {
    invoice {
      addInvoice(value: $value, memo: $memo)
    }
  }
`

const UPDATE_PENDING_INVOICE = gql`
  mutation updatePendingInvoice($hash: String!) {
    invoice {
      updatePendingInvoice(hash: $hash)
    }
  }
`

const GET_ONCHAIN_ADDRESS = gql`
  query getLastOnChainAddress {
    getLastOnChainAddress {
      id
    }
  }
`

type Props = {
  navigation: StackNavigationProp<MoveMoneyStackParamList, "receiveBitcoin">
}

export const ReceiveBitcoinScreen: ScreenType = ({ navigation }: Props) => {
  const client = useApolloClient()

  const { primaryCurrency, secondaryCurrency, toggleCurrency } = useCurrencies()

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const [primaryAmount, _, setPrimaryAmount, setPrimaryAmountValue] =
    useMoneyAmount(primaryCurrency)

  const [secondaryAmount, convertSecondaryAmount, setSecondaryAmount] =
    useMoneyAmount(secondaryCurrency)

  const satAmount =
    primaryCurrency === "BTC" ? primaryAmount.value : secondaryAmount.value

  const [addInvoice] = useMutation(ADD_INVOICE)
  const [updatePendingInvoice] = useMutation(UPDATE_PENDING_INVOICE)

  let lastOnChainAddress: string
  try {
    ;({
      getLastOnChainAddress: { id: lastOnChainAddress },
    } = client.readQuery({ query: GET_ONCHAIN_ADDRESS }))
  } catch (err) {
    // do better error handling
    lastOnChainAddress = "issue with the QRcode"
  }

  const [memo, setMemo] = useState("")
  const [loading, setLoading] = useState(true)
  const [invoice, setInvoice] = useState("")
  const [err, setErr] = useState("")
  const [isSucceed, setIsSucceed] = useState(false)
  const [brightnessInitial, setBrightnessInitial] = useState(null)

  const updateInvoice = useMemo(
    () =>
      debounce(async ({ satAmount, memo }) => {
        setLoading(true)
        try {
          const { data } = await addInvoice({
            variables: { value: satAmount, memo },
          })
          const invoice = data.invoice.addInvoice
          setInvoice(invoice)
        } catch (err) {
          console.error(err, "error with AddInvoice")
          setErr(`${err}`)
          throw err
        } finally {
          setLoading(false)
        }
      }, 750),
    [addInvoice],
  )

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
                  onPress: () => requestPermission(client),
                },
              ],
              { cancelable: true },
            ),
          waitUntilAuthorizationWindow,
        )
      }
    }

    notifRequest()
  }, [client])

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

  // temporary fix until we have a better management of notifications:
  // when coming back to active state. look if the invoice has been paid
  useEffect(() => {
    const _handleAppStateChange = async (nextAppState: AppStateStatus) => {
      if (nextAppState === "active") {
        try {
          const hash = getHashFromInvoice(invoice)

          const { data } = await updatePendingInvoice({ variables: { hash } })
          const success = await data.invoice.updatePendingInvoice
          if (success) {
            paymentSuccess()
          }
        } catch (err) {
          console.warn({ err }, "can't fetch invoice status")
        }
      }
    }

    AppState.addEventListener("change", _handleAppStateChange)

    return () => {
      AppState.removeEventListener("change", _handleAppStateChange)
    }
  }, [invoice, updatePendingInvoice, paymentSuccess])

  useEffect(() => {
    const unsubscribe = messaging().onMessage(async (remoteMessage) => {
      const hash = getHashFromInvoice(invoice)
      if (
        remoteMessage.data.type === "paid-invoice" &&
        remoteMessage.data.hash === hash
      ) {
        paymentSuccess()
      }
    })

    return unsubscribe
  }, [invoice, paymentSuccess])

  const inputMemoRef = React.useRef<TextInput>()

  useEffect(() => {
    Keyboard.addListener("keyboardDidHide", _keyboardDidHide)

    // cleanup function
    return () => {
      Keyboard.removeListener("keyboardDidHide", _keyboardDidHide)
    }
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
        <Swiper height={450} loop={false}>
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
          <QRView
            data={lastOnChainAddress}
            type="bitcoin"
            amount={satAmount}
            memo={memo}
            loading={loading}
            isSucceed={isSucceed}
            navigation={navigation}
            err={err}
          />
        </Swiper>
      </ScrollView>
    </Screen>
  )
}
