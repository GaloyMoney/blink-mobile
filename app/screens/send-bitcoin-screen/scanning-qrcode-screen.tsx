import { gql } from "@apollo/client"
import { LNURL_DOMAINS } from "@app/config"
import {
  useAccountDefaultWalletLazyQuery,
  useRealtimePriceQuery,
  useScanningQrCodeScreenQuery,
} from "@app/graphql/generated"
import { useIsAuthed } from "@app/graphql/is-authed-context"
import { useI18nContext } from "@app/i18n/i18n-react"
import { logParseDestinationResult } from "@app/utils/analytics"
import { toastShow } from "@app/utils/toast"
import Clipboard from "@react-native-clipboard/clipboard"
import crashlytics from "@react-native-firebase/crashlytics"
import { useIsFocused, useNavigation } from "@react-navigation/native"
import { StackNavigationProp } from "@react-navigation/stack"
import { Text, makeStyles, useTheme } from "@rneui/themed"
import * as React from "react"
import { Alert, Dimensions, Linking, Pressable, StyleSheet, View } from "react-native"
import { launchImageLibrary } from "react-native-image-picker"
import Svg, { Circle } from "react-native-svg"
import Icon from "react-native-vector-icons/Ionicons"
import {
  Camera,
  CameraRuntimeError,
  useCameraDevice,
  useCameraPermission,
  useCodeScanner,
} from "react-native-vision-camera"
import RNQRGenerator from "rn-qr-generator"
import { Screen } from "../../components/screen"
import { RootStackParamList } from "../../navigation/stack-param-lists"
import { parseDestination } from "./payment-destination"
import { DestinationDirection } from "./payment-destination/index.types"
import { GaloyPrimaryButton } from "@app/components/atomic/galoy-primary-button"

const { width: screenWidth } = Dimensions.get("window")
const { height: screenHeight } = Dimensions.get("window")

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
  const device = useCameraDevice("back")
  const { hasPermission, requestPermission } = useCameraPermission()

  const isFocused = useIsFocused()

  // const requestCameraPermission = React.useCallback(async () => {
  //   const permission = await Camera.requestCameraPermission()
  //   if (permission === "denied") await Linking.openSettings()
  // }, [])

  // React.useEffect(() => {
  //   if (cameraPermissionStatus !== "authorized") {
  //     requestCameraPermission()
  //   }
  // }, [cameraPermissionStatus, navigation, requestCameraPermission])
  React.useEffect(() => {
    if (!hasPermission) {
      requestPermission()
    }
  }, [hasPermission, requestPermission])

  const decodeInvoice = React.useMemo(() => {
    return async (data: string | undefined) => {
      if (pending || !wallets || !bitcoinNetwork || !data) {
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

  const codeScanner = useCodeScanner({
    codeTypes: ["qr", "ean-13"],
    onCodeScanned: (codes) => {
      codes.forEach((code) => decodeInvoice(code.value))
      console.log(`Scanned ${codes.length} codes!`)
    },
  })

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

  const onError = React.useCallback((error: CameraRuntimeError) => {
    console.error(error)
  }, [])

  if (!hasPermission) {
    const openSettings = () => {
      Linking.openSettings().catch(() => {
        Alert.alert(LL.ScanningQRCodeScreen.unableToOpenSettings())
      })
    }

    return (
      <Screen>
        <View style={styles.permissionMissing}>
          <Text type="h1" style={styles.permissionMissingText}>
            {LL.ScanningQRCodeScreen.permissionCamera()}
          </Text>
          <GaloyPrimaryButton
            title={LL.ScanningQRCodeScreen.openSettings()}
            onPress={openSettings}
          />
        </View>
      </Screen>
    )
  }

  if (device === null || device === undefined)
    return (
      <Screen>
        <View style={styles.permissionMissing}>
          <Text type="h1" style={styles.permissionMissingText}>
            {LL.ScanningQRCodeScreen.noCamera()}
          </Text>
        </View>
      </Screen>
    )

  return (
    <Screen unsafe>
      <View style={StyleSheet.absoluteFill}>
        <Camera
          style={StyleSheet.absoluteFill}
          device={device}
          isActive={isFocused}
          onError={onError}
          codeScanner={codeScanner}
        />
        <View style={styles.rectangleContainer}>
          <View style={styles.rectangle} />
        </View>
        <Pressable onPress={navigation.goBack}>
          <View style={styles.close}>
            <Svg viewBox="0 0 100 100">
              <Circle cx={50} cy={50} r={50} fill={colors._white} opacity={0.5} />
            </Svg>
            <Icon name="close" size={64} style={styles.iconClose} />
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
              name="clipboard-outline"
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

  permissionMissing: {
    alignItems: "center",
    flex: 1,
    justifyContent: "center",
    rowGap: 32,
  },

  permissionMissingText: {
    width: "80%",
    textAlign: "center",
  },
}))
