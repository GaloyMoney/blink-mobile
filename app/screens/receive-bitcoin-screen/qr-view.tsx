import LottieView from "lottie-react-native"
import * as React from "react"
import { useCallback, useMemo } from "react"
import {
  ActivityIndicator,
  Pressable,
  Text,
  View,
} from "react-native"
import EStyleSheet from "react-native-extended-stylesheet"
import QRCode from "react-native-qrcode-svg"
import LightningSats from "@app/assets/icons/lightning-sats.png"
import LightningUsd from "@app/assets/icons/lightning-usd.png"
import OnchainSats from "@app/assets/icons/onchain-btc.png"
import { palette } from "../../theme/palette"
import {
  getFullUri as getFullUriUtil,
  TYPE_LIGHTNING_BTC,
  TYPE_BITCOIN_ONCHAIN,
  TYPE_LIGHTNING_USD,
} from "../../utils/wallet"
import ReactNativeModal from "react-native-modal"

import successLottie from "../send-bitcoin-screen/success_lottie.json"

const configByType = {
  [TYPE_LIGHTNING_BTC]: {
    copyToClipboardLabel: "ReceiveBitcoinScreen.copyClipboard",
    shareButtonLabel: "common.shareLightning",
    ecl: "L" as const,
    icon: "ios-flash",
  },
  [TYPE_LIGHTNING_USD]: {
    copyToClipboardLabel: "ReceiveBitcoinScreen.copyClipboard",
    shareButtonLabel: "common.shareLightning",
    ecl: "L" as const,
    icon: "ios-flash",
  },
  [TYPE_BITCOIN_ONCHAIN]: {
    copyToClipboardLabel: "ReceiveBitcoinScreen.copyClipboardBitcoin",
    shareButtonLabel: "common.shareBitcoin",
    ecl: "M" as const,
    icon: "logo-bitcoin",
  },
}

type Props = {
  data: string
  type: GetFullUriInput["type"]
  amount: GetFullUriInput["amount"]
  memo: GetFullUriInput["memo"]
  loading: boolean
  completed: boolean
  err: string
  size?: number
}

export const QRView = ({
  data,
  type,
  amount,
  memo,
  loading,
  completed,
  err,
  size = 200,
}: Props): JSX.Element => {
  const [isModalVisible, setIsModalVisible] = React.useState(false)

  const toggleModal = () => {
    console.log("show modal" + isModalVisible)
    setIsModalVisible(!isModalVisible)
  }
  const isReady =
    !err &&
    (type === TYPE_LIGHTNING_BTC || type === TYPE_LIGHTNING_USD
      ? !loading && data !== ""
      : true)

  const getFullUri = useCallback(
    ({ input, uppercase = false, prefix = true }) =>
      getFullUriUtil({ type, amount, memo, input, uppercase, prefix }),
    [type, amount, memo],
  )

  const renderSuccessView = useMemo(() => {
    if (completed) {
      return (
        <LottieView
          source={successLottie}
          loop={false}
          autoPlay
          style={styles.lottie}
          resizeMode="cover"
        />
      )
    }
    return null
  }, [completed])

  const renderQRCode = useMemo(() => {
    const getQrLogo = () => {
      if (type === TYPE_LIGHTNING_BTC) return LightningSats
      if (type === TYPE_LIGHTNING_USD) return LightningUsd
      if (type === TYPE_BITCOIN_ONCHAIN) return OnchainSats
      return null
    }

    if (!completed && isReady) {
      return (
        <>
          <View style={styles.qrBackround}>
            <Pressable onPress={toggleModal}>
              <QRCode
                size={size}
                value={getFullUri({ input: data, uppercase: true })}
                logoBackgroundColor="white"
                ecl={configByType[type].ecl}
                logo={getQrLogo()}
                logoSize={60}
                logoBorderRadius={10}
              />
            </Pressable>
          </View>
          <ReactNativeModal
            isVisible={isModalVisible}
            onBackButtonPress={() => toggleModal()}
          >
            <View style={styles.qrContainer}>
              <Pressable onPress={toggleModal}>
                <QRCode
                  size={300}
                  value={getFullUri({ input: data, uppercase: true })}
                  logoBackgroundColor="white"
                  ecl={configByType[type].ecl}
                  logo={getQrLogo()}
                  logoSize={60}
                  logoBorderRadius={10}
                />
              </Pressable>
            </View>
          </ReactNativeModal>
        </>
      )
    }
    return null
  }, [isModalVisible, data, getFullUri, isReady, completed, type])

  const renderStatusView = useMemo(() => {
    if (!completed && !isReady) {
      return (
        <View style={styles.errorContainer}>
          {(err !== "" && (
            // eslint-disable-next-line react-native/no-inline-styles
            <Text style={{ color: palette.red, alignSelf: "center" }} selectable>
              {err}
            </Text>
          )) || <ActivityIndicator size="large" color={palette.blue} />}
        </View>
      )
    }
    return null
  }, [err, isReady, completed])

  return (
    <>
      <View style={styles.qr}>
        {renderSuccessView}
        {renderQRCode}
        {renderStatusView}
      </View>
    </>
  )
}

const styles = EStyleSheet.create({
  errorContainer: {
    alignContent: "center",
    alignItems: "center",
    alignSelf: "center",
    backgroundColor: palette.white,
    height: 280,
    justifyContent: "center",
    width: 280,
  },

  lottie: {
    height: "200rem",
    width: "200rem",
  },

  qr: {
    alignItems: "center",
  },
  qrBackround: {
    backgroundColor: palette.white,
    padding: 20,
    borderRadius: 10,
  },
  qrContainer: {
    alignItems: "center",
    justifyContent: "center",
    padding: 20,
    backgroundColor: palette.white,
    borderRadius: 10,
  },
})

export default React.memo(QRView)
