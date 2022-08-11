import LottieView from "lottie-react-native"
import * as React from "react"
import { useCallback, useMemo } from "react"
import { ActivityIndicator, Text, View } from "react-native"
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

import successLottie from "../send-bitcoin-screen/success_lottie.json"
import moment from "moment"
import { translateUnknown as translate } from "@galoymoney/client"

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
  expiresIn?: number
}

export const QRView = ({
  data,
  type,
  amount,
  memo,
  loading,
  completed,
  err,
  size = 320,
  expiresIn,
}: Props): JSX.Element => {
  const isReady = data && !loading && !err

  const getFullUri = useCallback(
    ({ input, uppercase = false, prefix = true }) =>
      getFullUriUtil({ type, amount, memo, input, uppercase, prefix }),
    [type, amount, memo],
  )

  const renderSuccessView = useMemo(() => {
    if (completed) {
      return (
        <View style={styles.container}>
          <LottieView
            source={successLottie}
            loop={false}
            autoPlay
            style={styles.lottie}
            resizeMode="cover"
          />
        </View>
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
          <View style={styles.container}>
            <QRCode
              size={size}
              value={getFullUri({ input: data, uppercase: true })}
              logoBackgroundColor="white"
              ecl={configByType[type].ecl}
              logo={getQrLogo()}
              logoSize={60}
              logoBorderRadius={10}
            />
          </View>
        </>
      )
    }
    return null
  }, [completed, isReady, type, size, getFullUri, data])

  const renderStatusView = useMemo(() => {
    if (!completed && !isReady) {
      return (
        <View style={styles.container}>
          <View style={styles.errorContainer}>
            {(err !== "" && (
              // eslint-disable-next-line react-native/no-inline-styles
              <Text style={{ color: palette.red, alignSelf: "center" }} selectable>
                {err}
              </Text>
            )) || <ActivityIndicator size="large" color={palette.blue} />}
          </View>
        </View>
      )
    }
    return null
  }, [err, isReady, completed])

  return (
    <>
      {expiresIn !== 0 && (
        <View style={styles.qr}>
          {renderSuccessView}
          {renderQRCode}
          {Boolean(expiresIn) && (
            <View style={styles.invoiceDisplay}>
              <Text style={expiresIn < 10 ? styles.lowTimer : undefined}>
                {translate("ReceiveBitcoinScreen.expiresIn")}:{" "}
                {moment.utc(expiresIn * 1000).format("m:ss")}
              </Text>
            </View>
          )}
          {renderStatusView}
        </View>
      )}
    </>
  )
}

const styles = EStyleSheet.create({
  container: {
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: palette.white,
    height: 380,
    width: "100%",
    borderRadius: 10,
  },
  errorContainer: {
    justifyContent: "center",
    height: "100%",
  },
  lottie: {
    height: "200rem",
    width: "200rem",
  },
  qr: {
    alignItems: "center",
  },
  invoiceDisplay: {
    marginTop: 14,
    marginHorizontal: 20,
  },
  lowTimer: {
    color: palette.red,
  },
})

export default React.memo(QRView)
