import { useIsFocused, useNavigation } from "@react-navigation/native"
import * as React from "react"
import { Alert, Dimensions, Linking, Pressable, StyleSheet, View } from "react-native"
import {
  Camera,
  CameraPermissionStatus,
  useCameraDevices,
} from "react-native-vision-camera"
import Svg, { Circle } from "react-native-svg"
import Icon from "react-native-vector-icons/Ionicons"
import { Screen } from "../../components/screen"
import Reanimated from "react-native-reanimated"
import { RootStackParamList } from "../../navigation/stack-param-lists"
import { StackNavigationProp } from "@react-navigation/stack"
import Clipboard from "@react-native-clipboard/clipboard"
import { useI18nContext } from "@app/i18n/i18n-react"
import RNQRGenerator from "rn-qr-generator"
import { BarcodeFormat, useScanBarcodes } from "vision-camera-code-scanner"
import { launchImageLibrary } from "react-native-image-picker"
import crashlytics from "@react-native-firebase/crashlytics"
import { gql } from "@apollo/client"
import {
  useAccountDefaultWalletLazyQuery,
  useRealtimePriceQuery,
  useScanningQrCodeScreenQuery,
} from "@app/graphql/generated"
import { parseDestination } from "./payment-destination"
import { DestinationDirection } from "./payment-destination/index.types"
import { useIsAuthed } from "@app/graphql/is-authed-context"
import { logParseDestinationResult } from "@app/utils/analytics"
import { LNURL_DOMAINS } from "@app/config"
import { makeStyles, useTheme } from "@rneui/themed"
import { toastShow } from "@app/utils/toast"

const { width: screenWidth } = Dimensions.get("window")
const { height: screenHeight } = Dimensions.get("window")

const useStyles = makeStyles(({ colors }) => ({
  close: {
    alignSelf: "flex-end",
    height: 64,
    marginRight: 16,
    marginTop: 40,
    width: 64,
  },

  openGallery: {
    height: 128,
    left: 32,
    position: "absolute",
    top: screenHeight - 96,
    width: screenWidth,
  },

  rectangle: {
    borderColor: colors.primary,
    borderWidth: 2,
    height: screenWidth * 0.65,
    width: screenWidth * 0.65,
  },

  rectangleContainer: {
    alignItems: "center",
    bottom: 0,
    justifyContent: "center",
    left: 0,
    position: "absolute",
    right: 0,
    top: 0,
  },

  noPermissionsView: {
    ...StyleSheet.absoluteFillObject,
  },

  iconClose: { position: "absolute", top: -2, color: colors._black },

  iconGalery: { opacity: 0.8 },

  iconClipboard: { opacity: 0.8, position: "absolute", bottom: "5%", right: "15%" },
}))

gql`
  query scanningQRCodeScreen {
    globals {
      network
    }
    me {
      id
      defaultAccount {
        id
        wallets {
          id
        }
      }
      contacts {
        id
        username
      }
    }
  }
`

export const ScanningQRCodeScreen: React.FC = () => {
  const navigation =
    useNavigation<StackNavigationProp<RootStackParamList, "sendBitcoinDestination">>()

  // forcing price refresh
  useRealtimePriceQuery({
    fetchPolicy: "network-only",
  })

  const {
    theme: { colors },
  } = useTheme()

  const [pending, setPending] = React.useState(false)

  const { data } = useScanningQrCodeScreenQuery({ skip: !useIsAuthed() })
  const wallets = data?.me?.defaultAccount.wallets
  const bitcoinNetwork = data?.globals?.network
  const [accountDefaultWalletQuery] = useAccountDefaultWalletLazyQuery({
    fetchPolicy: "no-cache",
  })

  const { LL } = useI18nContext()
  const devices = useCameraDevices()
  const [cameraPermissionStatus, setCameraPermissionStatus] =
    React.useState<CameraPermissionStatus>("not-determined")
  const isFocused = useIsFocused()
  const [frameProcessor, barcodes] = useScanBarcodes([BarcodeFormat.QR_CODE], {
    checkInverted: true,
  })
  const device = devices.back

  const requestCameraPermission = React.useCallback(async () => {
    const permission = await Camera.requestCameraPermission()
    if (permission === "denied") await Linking.openSettings()
    setCameraPermissionStatus(permission)
  }, [])

  React.useEffect(() => {
    if (cameraPermissionStatus !== "authorized") {
      requestCameraPermission()
    }
  }, [cameraPermissionStatus, navigation, requestCameraPermission])

  const decodeInvoice = React.useMemo(() => {
    return async (data: string) => {
      if (pending || !wallets || !bitcoinNetwork) {
        return
      }
      try {
        setPending(true)

        const destination = await parseDestination({
          rawInput: data,
          myWalletIds: wallets.map((wallet) => wallet.id),
          bitcoinNetwork,
          lnurlDomains: LNURL_DOMAINS,
          accountDefaultWalletQuery,
        })
        logParseDestinationResult(destination)

        if (destination.valid) {
          if (destination.destinationDirection === DestinationDirection.Send) {
            navigation.replace("sendBitcoinDetails", {
              paymentDestination: destination,
            })
            return
          }

          navigation.reset({
            routes: [
              {
                name: "Primary",
              },
              {
                name: "redeemBitcoinDetail",
                params: {
                  receiveDestination: destination,
                },
              },
            ],
          })
          return
        }

        Alert.alert(
          LL.ScanningQRCodeScreen.invalidTitle(),
          destination.invalidReason === "InvoiceExpired"
            ? LL.ScanningQRCodeScreen.expiredContent({
                found: data.toString(),
              })
            : LL.ScanningQRCodeScreen.invalidContent({
                found: data.toString(),
              }),
          [
            {
              text: LL.common.ok(),
              onPress: () => setPending(false),
            },
          ],
        )
      } catch (err: unknown) {
        if (err instanceof Error) {
          crashlytics().recordError(err)
          Alert.alert(err.toString(), "", [
            {
              text: LL.common.ok(),
              onPress: () => setPending(false),
            },
          ])
        }
      }
    }
  }, [
    LL.ScanningQRCodeScreen,
    LL.common,
    navigation,
    pending,
    bitcoinNetwork,
    wallets,
    accountDefaultWalletQuery,
  ])
  const styles = useStyles()

  React.useEffect(() => {
    if (barcodes.length > 0 && barcodes[0].rawValue && isFocused) {
      decodeInvoice(barcodes[0].rawValue)
    }
  }, [barcodes, decodeInvoice, isFocused])

  const handleInvoicePaste = async () => {
    try {
      const data = await Clipboard.getString()
      decodeInvoice(data)
    } catch (err: unknown) {
      if (err instanceof Error) {
        crashlytics().recordError(err)
        Alert.alert(err.toString())
      }
    }
  }

  const showImagePicker = async () => {
    try {
      const result = await launchImageLibrary({ mediaType: "photo" })
      if (result.errorCode === "permission") {
        toastShow({
          message: (translations) =>
            translations.ScanningQRCodeScreen.imageLibraryPermissionsNotGranted(),
          LL,
        })
      }
      if (result.assets && result.assets.length > 0 && result.assets[0].uri) {
        const qrCodeValues = await RNQRGenerator.detect({ uri: result.assets[0].uri })
        if (qrCodeValues && qrCodeValues.values.length > 0) {
          decodeInvoice(qrCodeValues.values[0])
        } else {
          Alert.alert(LL.ScanningQRCodeScreen.noQrCode())
        }
      }
    } catch (err: unknown) {
      if (err instanceof Error) {
        crashlytics().recordError(err)
        Alert.alert(err.toString())
      }
    }
  }

  if (cameraPermissionStatus !== "authorized") {
    return <View style={styles.noPermissionsView} />
  }

  return (
    <Screen unsafe>
      <View style={StyleSheet.absoluteFill}>
        {device && (
          <Reanimated.View style={StyleSheet.absoluteFill}>
            <Camera
              style={StyleSheet.absoluteFill}
              device={device}
              isActive={isFocused}
              frameProcessor={frameProcessor}
              frameProcessorFps={5}
            />
          </Reanimated.View>
        )}
        <View style={styles.rectangleContainer}>
          <View style={styles.rectangle} />
        </View>
        <Pressable onPress={navigation.goBack}>
          <View style={styles.close}>
            <Svg viewBox="0 0 100 100">
              <Circle cx={50} cy={50} r={50} fill={colors._white} opacity={0.5} />
            </Svg>
            <Icon name="ios-close" size={64} style={styles.iconClose} />
          </View>
        </Pressable>
        <View style={styles.openGallery}>
          <Pressable onPress={showImagePicker}>
            <Icon
              name="image"
              size={64}
              color={colors._lightGrey}
              style={styles.iconGalery}
            />
          </Pressable>
          <Pressable onPress={handleInvoicePaste}>
            {/* we could Paste from "FontAwesome" but as svg*/}
            <Icon
              name="ios-clipboard-outline"
              size={64}
              color={colors._lightGrey}
              style={styles.iconClipboard}
            />
          </Pressable>
        </View>
      </View>
    </Screen>
  )
}
