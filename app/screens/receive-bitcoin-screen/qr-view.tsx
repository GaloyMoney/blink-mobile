import * as React from "react"
import { useCallback, useMemo } from "react"
import {
  ActivityIndicator,
  Text,
  useWindowDimensions,
  View,
  Platform,
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

import { testProps } from "../../utils/testProps"
import { GaloyIcon } from "@app/components/atomic/galoy-icon"

const configByType = {
  [TYPE_LIGHTNING_BTC]: {
    copyToClipboardLabel: "ReceiveWrapperScreen.copyClipboard",
    shareButtonLabel: "common.shareLightning",
    ecl: "L" as const,
    icon: "ios-flash",
  },
  [TYPE_LIGHTNING_USD]: {
    copyToClipboardLabel: "ReceiveWrapperScreen.copyClipboard",
    shareButtonLabel: "common.shareLightning",
    ecl: "L" as const,
    icon: "ios-flash",
  },
  [TYPE_BITCOIN_ONCHAIN]: {
    copyToClipboardLabel: "ReceiveWrapperScreen.copyClipboardBitcoin",
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

export const QRView: React.FC<Props> = ({
  data,
  type,
  amount,
  memo,
  loading,
  completed,
  err,
  size = 320,
}) => {
  const { scale } = useWindowDimensions()
  const isReady = data && !loading && !err

  const getFullUri = useCallback(
    ({
      input,
      uppercase = false,
      prefix = true,
    }: {
      input: string
      uppercase?: boolean
      prefix?: boolean
    }) => getFullUriUtil({ type, amount, memo, input, uppercase, prefix }),
    [type, amount, memo],
  )

  const renderSuccessView = useMemo(() => {
    if (completed) {
      return (
        <View {...testProps("Success Icon")} style={styles.container}>
          <GaloyIcon name={"payment-success"} size={128} />
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

    const getQrSize = () => {
      if (Platform.OS === "android") {
        if (scale > 3) {
          return 260
        }
      }
      return size
    }

    if (!completed && isReady) {
      return (
        <>
          <View style={styles.container}>
            <QRCode
              size={getQrSize()}
              value={getFullUri({ input: data, uppercase: true })}
              logoBackgroundColor="white"
              ecl={type && configByType[type].ecl}
              logo={getQrLogo() || undefined}
              logoSize={60}
              logoBorderRadius={10}
            />
          </View>
        </>
      )
    }
    return null
  }, [completed, isReady, type, getFullUri, size, scale, data])

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
      <View style={styles.qr}>
        {renderSuccessView}
        {renderQRCode}
        {renderStatusView}
      </View>
    </>
  )
}

const styles = EStyleSheet.create({
  container: {
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: palette.white,
    width: "100%",
    height: undefined,
    borderRadius: 10,
    aspectRatio: 1,
    alignSelf: "center",
    padding: 16,
  },
  errorContainer: {
    justifyContent: "center",
    height: "100%",
  },
  qr: {
    alignItems: "center",
  },
})

export default React.memo(QRView)
