import * as React from "react"
import { useMemo } from "react"
import {
  ActivityIndicator,
  Text,
  useWindowDimensions,
  View,
  Platform,
  StyleSheet,
} from "react-native"
import QRCode from "react-native-qrcode-svg"

import LightningSats from "@app/assets/icons/lightning-sats.png"
import LightningUsd from "@app/assets/icons/lightning-usd.png"
import OnchainSats from "@app/assets/icons/onchain-btc.png"

import { palette } from "../../theme/palette"
import {
  TYPE_LIGHTNING_BTC,
  TYPE_BITCOIN_ONCHAIN,
  TYPE_LIGHTNING_USD,
} from "./payment-requests/helpers"

import { testProps } from "../../utils/testProps"
import { GaloyIcon } from "@app/components/atomic/galoy-icon"
import { GetFullUriFn } from "./payment-requests/index.types"
import { SuccessIconAnimation } from "@app/components/success-animation"

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
  type: GetFullUriInput["type"]
  getFullUri: GetFullUriFn | undefined
  loading: boolean
  completed: boolean
  err: string
  size?: number
}

export const QRView: React.FC<Props> = ({
  type,
  getFullUri,
  loading,
  completed,
  err,
  size = 320,
}) => {
  const { scale } = useWindowDimensions()
  const isReady = getFullUri && !loading && !err

  const renderSuccessView = useMemo(() => {
    if (completed) {
      return (
        <View {...testProps("Success Icon")} style={styles.container}>
          <SuccessIconAnimation>
            <GaloyIcon name={"payment-success"} size={128} />
          </SuccessIconAnimation>
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
              value={getFullUri({ uppercase: true })}
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
  }, [completed, isReady, type, getFullUri, size, scale])

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

const styles = StyleSheet.create({
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
