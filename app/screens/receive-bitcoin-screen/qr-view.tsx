import * as React from "react"
import { useMemo } from "react"
import {
  ActivityIndicator,
  useWindowDimensions,
  View,
  Platform,
  StyleProp,
  ViewStyle,
  Pressable,
  Animated,
} from "react-native"
import QRCode from "react-native-qrcode-svg"

import Logo from "@app/assets/logo/blink-logo-icon.png"

import { Invoice, InvoiceType } from "./payment/index.types"

import { testProps } from "../../utils/testProps"
import { GaloyIcon } from "@app/components/atomic/galoy-icon"
import { GetFullUriFn } from "./payment/index.types"
import { SuccessIconAnimation } from "@app/components/success-animation"
import { makeStyles, Text, useTheme } from "@rneui/themed"
import { GaloyTertiaryButton } from "@app/components/atomic/galoy-tertiary-button"

const configByType = {
  [Invoice.Lightning]: {
    copyToClipboardLabel: "ReceiveScreen.copyClipboard",
    shareButtonLabel: "common.shareLightning",
    ecl: "L" as const,
    icon: "ios-flash",
  },
  [Invoice.OnChain]: {
    copyToClipboardLabel: "ReceiveScreen.copyClipboardBitcoin",
    shareButtonLabel: "common.shareBitcoin",
    ecl: "M" as const,
    icon: "logo-bitcoin",
  },
  // TODO: Add them
  [Invoice.PayCode]: {
    copyToClipboardLabel: "ReceiveScreen.copyClipboardBitcoin",
    shareButtonLabel: "common.shareBitcoin",
    ecl: "M" as const,
    icon: "logo-bitcoin",
  },
}

type Props = {
  type: InvoiceType
  getFullUri: GetFullUriFn | undefined
  loading: boolean
  completed: boolean
  err: string
  size?: number
  style?: StyleProp<ViewStyle>
  expired: boolean
  regenerateInvoiceFn?: () => void
  copyToClipboard?: () => void | undefined
  isPayCode: boolean
  canUsePayCode: boolean
  toggleIsSetLightningAddressModalVisible: () => void
}

export const QRView: React.FC<Props> = ({
  type,
  getFullUri,
  loading,
  completed,
  err,
  size = 240,
  style,
  expired,
  regenerateInvoiceFn,
  copyToClipboard,
  isPayCode,
  canUsePayCode,
  toggleIsSetLightningAddressModalVisible,
}) => {
  const {
    theme: { colors },
  } = useTheme()
  const isPayCodeAndCanUsePayCode = isPayCode && canUsePayCode

  const isReady = (!isPayCodeAndCanUsePayCode || Boolean(getFullUri)) && !loading && !err
  const displayingQR =
    !completed && isReady && !expired && (!isPayCode || isPayCodeAndCanUsePayCode)

  const styles = useStyles(displayingQR)
  const { scale } = useWindowDimensions()

  const scaleAnim = React.useRef(new Animated.Value(1)).current

  const breatheIn = () => {
    Animated.timing(scaleAnim, {
      toValue: 0.95,
      duration: 50,
      useNativeDriver: true,
    }).start()
  }

  const breatheOut = () => {
    if (copyToClipboard) copyToClipboard()
    Animated.timing(scaleAnim, {
      toValue: 1,
      duration: 10,
      useNativeDriver: true,
    }).start()
  }

  const renderSuccessView = useMemo(() => {
    if (completed) {
      return (
        <View {...testProps("Success Icon")} style={[styles.container, style]}>
          <SuccessIconAnimation>
            <GaloyIcon name={"payment-success"} size={128} />
          </SuccessIconAnimation>
        </View>
      )
    }
    return null
  }, [completed, styles])

  const renderQRCode = useMemo(() => {
    const getQrLogo = () => {
      if (type === Invoice.OnChain) return Logo
      if (type === Invoice.Lightning) return Logo
      if (type === Invoice.PayCode) return Logo
      return null
    }

    const getQrSize = () => {
      if (Platform.OS === "android") {
        if (scale > 3) {
          return 195
        }
      }
      return size
    }

    if (displayingQR && getFullUri) {
      const uri = getFullUri({ uppercase: true })
      return (
        <View style={[styles.container, style]}>
          <QRCode
            size={getQrSize()}
            value={uri}
            logoBackgroundColor="white"
            ecl={type && configByType[type].ecl}
            logo={getQrLogo() || undefined}
            logoSize={60}
            logoBorderRadius={10}
          />
        </View>
      )
    }
    return null
  }, [displayingQR, type, getFullUri, size, scale, styles])

  const renderStatusView = useMemo(() => {
    if (!completed && !isReady) {
      return (
        <View style={[styles.container, style]}>
          <View style={styles.errorContainer}>
            {(err !== "" && (
              <Text style={styles.error} selectable>
                {err}
              </Text>
            )) || <ActivityIndicator size="large" color={colors.primary} />}
          </View>
        </View>
      )
    } else if (expired) {
      return (
        <View style={[styles.container, style]}>
          <Text type="p2" style={styles.expiredInvoice}>
            Invoice has expired
          </Text>
          <GaloyTertiaryButton
            title="Regenerate Invoice"
            onPress={regenerateInvoiceFn}
          ></GaloyTertiaryButton>
        </View>
      )
    } else if (isPayCode && !canUsePayCode) {
      return (
        <View style={[styles.container, styles.cantUsePayCode, style]}>
          <Text type="p2" style={styles.cantUsePayCodeText}>
            Set your username to accept via Paycode QR (LNURL) and Lightning Address
          </Text>
          <GaloyTertiaryButton
            title="Set Username"
            onPress={toggleIsSetLightningAddressModalVisible}
          ></GaloyTertiaryButton>
        </View>
      )
    }
    return null
  }, [
    err,
    isReady,
    completed,
    styles,
    colors,
    expired,
    loading,
    isPayCode,
    canUsePayCode,
  ])

  return (
    <View style={styles.qr}>
      <Pressable onPressIn={breatheIn} onPressOut={breatheOut}>
        <Animated.View style={{ transform: [{ scale: scaleAnim }] }}>
          {renderSuccessView}
          {renderQRCode}
          {renderStatusView}
        </Animated.View>
      </Pressable>
    </View>
  )
}

const useStyles = makeStyles(({ colors }, displayingQR: boolean) => ({
  container: {
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: displayingQR ? colors._white : colors.background,
    width: "100%",
    height: undefined,
    borderRadius: 10,
    aspectRatio: 1,
    alignSelf: "center",
    padding: 16,
  },
  containerSuccess: {
    backgroundColor: colors.white,
  },
  errorContainer: {
    justifyContent: "center",
    height: "100%",
  },
  error: { color: colors.error, alignSelf: "center" },
  qr: {
    alignItems: "center",
  },
  expiredInvoice: {
    marginBottom: 10,
  },
  cantUsePayCode: {
    padding: "10%",
  },
  cantUsePayCodeText: {
    marginBottom: 10,
  },
}))

export default React.memo(QRView)
