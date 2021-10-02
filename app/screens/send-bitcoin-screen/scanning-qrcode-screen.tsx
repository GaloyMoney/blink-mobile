import { useApolloClient } from "@apollo/client"
import { useIsFocused, useNavigationState } from "@react-navigation/native"
import * as React from "react"
import { Alert, Dimensions, Pressable, View, ViewStyle } from "react-native"
import { RNCamera } from "react-native-camera"
import EStyleSheet from "react-native-extended-stylesheet"
import { launchImageLibrary } from "react-native-image-picker"
import Svg, { Circle } from "react-native-svg"
import Icon from "react-native-vector-icons/Ionicons"
import { Screen } from "../../components/screen"
import { translate } from "../../i18n"
import { palette } from "../../theme/palette"
import type { ScreenType } from "../../types/jsx"
import { validPayment } from "../../utils/parsing"

import LocalQRCode from "@remobile/react-native-qrcode-local-image"
import { MoveMoneyStackParamList } from "../../navigation/stack-param-lists"
import { StackNavigationProp } from "@react-navigation/stack"
import useToken from "../../utils/use-token"

const CAMERA: ViewStyle = {
  width: "100%",
  height: "100%",
  position: "absolute",
}

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
})

type ScanningQRCodeScreenProps = {
  navigation: StackNavigationProp<MoveMoneyStackParamList, "sendBitcoin">
}

export const ScanningQRCodeScreen: ScreenType = ({
  navigation,
}: ScanningQRCodeScreenProps) => {
  const index = useNavigationState((state) => state.index)
  const [pending, setPending] = React.useState(false)
  const client = useApolloClient()
  const { tokenNetwork } = useToken()

  const decodeInvoice = async (data) => {
    if (pending) {
      return
    }

    try {
      const { valid } = validPayment(data, tokenNetwork, client)
      if (valid) {
        if (index <= 1) {
          navigation.replace("sendBitcoin", { payment: data })
        } else {
          navigation.navigate("sendBitcoin", { payment: data })
        }
      } else {
        setPending(true)
        Alert.alert(
          translate("ScanningQRCodeScreen.invalidTitle"),
          translate("ScanningQRCodeScreen.invalidContent", { found: data.toString() }),
          [
            {
              text: translate("common.ok"),
              onPress: () => setPending(false),
            },
          ],
        )
      }
    } catch (err) {
      Alert.alert(err.toString())
    }
  }

  const showImagePicker = () => {
    try {
      launchImageLibrary(
        {
          mediaType: "photo",
        },
        (response) => {
          if (response.assets[0].uri) {
            const uri = response.assets[0].uri.toString().replace("file://", "")
            LocalQRCode.decode(uri, (error, result) => {
              if (!error) {
                decodeInvoice(result)
              } else if (error.message === "Feature size is zero!") {
                Alert.alert(translate("ScanningQRCodeScreen.noQrCode"))
              } else {
                console.log({ error })
                Alert.alert(`${error}`)
              }
            })
          }
        },
      )
    } catch (err) {
      // link to issue
      // Fatal Exception: java.lang.RuntimeException: Failure delivering result ResultInfo{who=null, request=13002, result=-1, data=Intent { dat=content://media/external/images/media/12345 flg=0x1 (has extras) }} to activity {com.galoyapp/com.galoyapp.MainActivity}: java.lang.RuntimeException: Illegal callback invocation from native module. This callback type only permits a single invocation from native code.
      // ??

      console.error(err)
    }
  }

  return (
    <Screen unsafe>
      {useIsFocused() && (
        <RNCamera
          style={CAMERA}
          captureAudio={false}
          onBarCodeRead={(event) => {
            const qr = event.data
            decodeInvoice(qr)
          }}
          onTap={(r) => console.log({ r })}
        >
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
          </View>
        </RNCamera>
      )}
    </Screen>
  )
}
