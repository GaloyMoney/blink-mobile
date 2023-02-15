import { useIsFocused } from "@react-navigation/native"
import * as React from "react"
import {
  Alert,
  Dimensions,
  Linking,
  Platform,
  Pressable,
  StyleSheet,
  View,
} from "react-native"
import {
  Camera,
  CameraPermissionStatus,
  useCameraDevices,
} from "react-native-vision-camera"
import EStyleSheet from "react-native-extended-stylesheet"
import Svg, { Circle } from "react-native-svg"
import Icon from "react-native-vector-icons/Ionicons"
import Paste from "react-native-vector-icons/FontAwesome"
import { Screen } from "../../components/screen"
import { palette } from "../../theme/palette"
import Reanimated from "react-native-reanimated"
import { RootStackParamList } from "../../navigation/stack-param-lists"
import { StackNavigationProp } from "@react-navigation/stack"
import Clipboard from "@react-native-clipboard/clipboard"
import { useI18nContext } from "@app/i18n/i18n-react"
import RNQRGenerator from "rn-qr-generator"
import { BarcodeFormat, useScanBarcodes } from "vision-camera-code-scanner"
import ImagePicker from "react-native-image-crop-picker"
import { lnurlDomains } from "./send-bitcoin-destination-screen"
import crashlytics from "@react-native-firebase/crashlytics"
import { gql } from "@apollo/client"
import {
  useScanningQrCodeScreenQuery,
  useUserDefaultWalletIdLazyQuery,
} from "@app/graphql/generated"
import { parseDestination } from "./payment-destination"
import { DestinationDirection } from "./payment-destination/index.types"
import { useIsAuthed } from "@app/graphql/is-authed-context"

const { width: screenWidth } = Dimensions.get("window")
const { height: screenHeight } = Dimensions.get("window")

const styles = EStyleSheet.create({
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

  // eslint-disable-next-line react-native/no-color-literals
  rectangle: {
    backgroundColor: "transparent",
    borderColor: palette.blue,
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
    backgroundColor: palette.black,
  },
})

type ScanningQRCodeScreenProps = {
  navigation: StackNavigationProp<RootStackParamList, "sendBitcoinDestination">
}

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

  # TODO replace with AccountDefaultWallet?
  query userDefaultWalletId($username: Username!) {
    userDefaultWalletId(username: $username)
  }
`

export const ScanningQRCodeScreen: React.FC<ScanningQRCodeScreenProps> = ({
  navigation,
}) => {
  const [pending, setPending] = React.useState(false)

  const { data } = useScanningQrCodeScreenQuery({ skip: !useIsAuthed() })
  const wallets = data?.me?.defaultAccount.wallets
  const bitcoinNetwork = data?.globals?.network
  const [userDefaultWalletIdQuery] = useUserDefaultWalletIdLazyQuery({
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
          lnurlDomains,
          userDefaultWalletIdQuery,
        })

        if (destination.valid) {
          if (destination.destinationDirection === DestinationDirection.Send) {
            return navigation.navigate("sendBitcoinDetails", {
              paymentDestination: destination,
            })
          }

          return navigation.reset({
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
        }

        Alert.alert(
          LL.ScanningQRCodeScreen.invalidTitle(),
          LL.ScanningQRCodeScreen.invalidContent({
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
    userDefaultWalletIdQuery,
  ])

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
      const response = await ImagePicker.openPicker({})
      let qrCodeValues
      if (Platform.OS === "ios" && response.sourceURL) {
        qrCodeValues = await RNQRGenerator.detect({ uri: response.sourceURL })
      }
      if (Platform.OS === "android" && response.path) {
        qrCodeValues = await RNQRGenerator.detect({ uri: response.path })
      }
      if (qrCodeValues && qrCodeValues.values.length > 0) {
        decodeInvoice(qrCodeValues.values[0])
      } else {
        Alert.alert(LL.ScanningQRCodeScreen.noQrCode())
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
              <Circle cx={50} cy={50} r={50} fill={palette.white} opacity={0.5} />
            </Svg>
            <Icon
              name="ios-close"
              size={64}
              // eslint-disable-next-line react-native/no-inline-styles
              style={{ position: "absolute", top: -2 }}
            />
          </View>
        </Pressable>
        <View style={styles.openGallery}>
          <Pressable onPress={showImagePicker}>
            <Icon
              name="image"
              size={64}
              color={palette.lightGrey}
              // eslint-disable-next-line react-native/no-inline-styles
              style={{ opacity: 0.8 }}
            />
          </Pressable>
          <Pressable onPress={handleInvoicePaste}>
            <Paste
              name="paste"
              size={64}
              color={palette.lightGrey}
              // eslint-disable-next-line react-native/no-inline-styles
              style={{ opacity: 0.8, position: "absolute", bottom: "5%", right: "15%" }}
            />
          </Pressable>
        </View>
      </View>
    </Screen>
  )
}
