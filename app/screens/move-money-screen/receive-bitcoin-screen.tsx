import Clipboard from "@react-native-community/clipboard"
import analytics from '@react-native-firebase/analytics'
import messaging from '@react-native-firebase/messaging'
import * as lightningPayReq from "bolt11"
import { values } from "mobx"
import { observer } from "mobx-react"
import * as React from "react"
import { useEffect, useState } from "react"
import { ActivityIndicator, Alert, Dimensions, Platform, Pressable, Share, Text, View } from "react-native"
import { Button, ButtonGroup } from "react-native-elements"
import EStyleSheet from "react-native-extended-stylesheet"
import ReactNativeHapticFeedback from "react-native-haptic-feedback"
import QRCode from 'react-native-qrcode-svg'
import Icon from "react-native-vector-icons/Ionicons"
import { InputPaymentDataInjected } from "../../components/input-payment"
import { Screen } from "../../components/screen"
import { translate } from "../../i18n"
import { StoreContext } from "../../models"
import { palette } from "../../theme/palette"
import { getHash } from "../../utils/lightning"
import { requestPermission } from "../../utils/notifications"

var width = Dimensions.get('window').width; //full width


const styles = EStyleSheet.create({
  buttonStyle: {
    backgroundColor: palette.lightBlue,
  },

  icon: {
    color: palette.darkGrey,
    marginRight: 15,
  },

  qr: {
    marginTop: "24rem",
    alignItems: "center",
    flex: 1,
  },

  section: {
    width: width - 40, // FIXME
    paddingHorizontal: 20,
  },

  smallText: {
    color: palette.darkGrey,
    fontSize: 18,
    textAlign: "left",
  },

  headerView: {
    marginHorizontal: "20rem",
    marginTop: "12rem",
    marginBottom: "6rem",
  }
})

export const ReceiveBitcoinScreen = observer(({ navigation }) => {
  // TODO FIXME: crash if no connection

  const store = React.useContext(StoreContext)

  // FIXME TODO add back a way to set a memo
  const [memo, setMemo] = useState("")

  const [amount, setAmount] = useState(0)
  const [loading, setLoading] = useState(true)

  const [networkIndex, setNetworkIndex] = useState(0)
  const [data, setData] = useState("")

  useEffect(() => {
    update()
  }, [networkIndex])

  useEffect(() => {
    const notifRequest = async () => {

      const waitUntilAuthorizationWindow = 5000

      if (Platform.OS === 'ios') {      
        const authorizationStatus = await messaging().hasPermission();
  
        let hasPermissions = false
  
        if (authorizationStatus === messaging.AuthorizationStatus.AUTHORIZED) {
          hasPermissions = true
          console.tron.log('User has notification permissions enabled.');
        } else if (authorizationStatus === messaging.AuthorizationStatus.PROVISIONAL) {
          console.tron.log('User has provisional notification permissions.');
        } else {
          console.tron.log('User has notification permissions disabled');
        }
  
        if (hasPermissions) {
          return
        }
  
        setTimeout(
        () => Alert.alert(
          translate("common.notification"), 
          translate("ReceiveBitcoinScreen.activateNotifications"), 
        [
          {
            text: translate("common.later"),
            // todo: add analytics
            onPress: () => console.tron.log("Cancel/Later Pressed"),
            style: "cancel"
          },
          {
            text: translate("common.ok"),
            onPress: () => requestPermission(store)
          },
        ], { cancelable: true })
        , waitUntilAuthorizationWindow)
      } 
    }

    notifRequest()
  }, [])

  const update = async () => {
    if (networkIndex === 0) {
      await createInvoice()
    } else {
      const uri = `bitcoin:${values(store.lastOnChainAddresses)[0].id}`
      setData(amount === 0 ? uri : uri + `?amount=${amount / 10 ** 8}`)
      setLoading(false)
    }
  }

  const copyInvoice = () => {
    Clipboard.setString(data)
    Alert.alert(translate("ReceiveBitcoinScreen.copyClipboard"))
  }

  const shareInvoice = async () => {
    try {
      const result = await Share.share({
        message: data,
      })

      if (result.action === Share.sharedAction) {
        if (result.activityType) {
          // shared with activity type of result.activityType
        } else {
          // shared
        }
      } else if (result.action === Share.dismissedAction) {
        // dismissed
      }
    } catch (error) {
      Alert.alert(error.message)
    }
  }

  useEffect(() => {
    const unsubscribe = messaging().onMessage(async remoteMessage => {
      if (networkIndex === 0) {

        let invoiceDecoded

        try {
          invoiceDecoded = lightningPayReq.decode(data)
        } catch (err) {
          console.tron.log(`error decoding the invoice: ${err}`)
        }
        
        if (!invoiceDecoded) {
          return
        }
        
        const hash = getHash(invoiceDecoded)  
        if (remoteMessage.data.type === "paid-invoice" && remoteMessage.data.hash === hash) {
          success()
        }

      } else {
        console.tron.log("// TODO bitcoin as well")
      }

    });

    return unsubscribe;
  }, [data]); // FIXME: not sure why data need to be in scope here, but otherwise the async function will have data = null

  const createInvoice = async () => {
    setLoading(true)
    console.tron.log("createInvoice")
    try {
      const query = `mutation addInvoice($value: Int, $memo: String) {
        invoice {
          addInvoice(value: $value, memo: $memo)
        }
      }`

      const result = await store.mutate(query, {value: amount, memo})
      const invoice = result.invoice.addInvoice
      setData(invoice)
      console.tron.log("data has been set")

    } catch (err) {
      console.tron.log(`error with AddInvoice: ${err}`)
      throw err
    } finally {
      setLoading(false)
    }
  }

  const success = () => {
    const options = {
      enableVibrateFallback: true,
      ignoreAndroidSystemSettings: false,
    }

    store.queryWallet()

    // FIXME (with notifications?): this is very approximative:
    // 1 - it will only trigger if the payment is receiving while the screen is opened
    // 2 - amount in the variable could be different than the amount receive by the payment
    //     if the user has changed the amount and created a new invoice
    analytics().logEarnVirtualCurrency({value: amount, virtual_currency_name: "btc"})

    ReactNativeHapticFeedback.trigger("notificationSuccess", options)
    Alert.alert("success", translate("ReceiveBitcoinScreen.invoicePaid"), [{
      text: translate("common.ok"),
      onPress: () => {
        navigation.goBack(false)
      },
    }])
  }

  return (
    <Screen backgroundColor={palette.lighterGrey} preset="scroll" >
      <View style={styles.headerView}>
        <ButtonGroup
          onPress={index => setNetworkIndex(index)}
          selectedIndex={networkIndex}
          buttons={["Lightning", "Bitcoin"]}
          selectedTextStyle={{fontWeight: "bold", fontSize: 18}}
          disabledTextStyle={{fontWeight: "bold"}}
          containerStyle={{borderRadius: 24}}
          selectedButtonStyle={{backgroundColor: palette.lightBlue}}
        />
      </View>
        <View style={styles.section}>
          <InputPaymentDataInjected 
            onUpdateAmount={amount => setAmount(amount)}
            onBlur={update}
            forceKeyboard={false}
          />
        </View>
        {/* <View style={styles.section}>
          <Input placeholder="Optional note" value={memo} onChangeText={(text) => setMemo(text)} />
        </View> */}
        <View style={styles.qr} >
          {!loading && 
            <Pressable onPress={copyInvoice}>
              <QRCode size={280} value={data} logoBackgroundColor='white' ecl="M"
              logo={Icon.getImageSourceSync(networkIndex === 0 ? "ios-flash" : "logo-bitcoin", 64, palette.orange)} />
            </Pressable>
          }
          {loading && 
            <View style={{ width: 280, height: 280, 
                alignItems: "center", alignContent: "center", 
                alignSelf: "center", backgroundColor: palette.white,
                justifyContent: 'center'
              }}>
              <ActivityIndicator size="large" color={palette.blue} />
            </View>
          }
          {loading && <Text> </Text> || <Text>{translate("ReceiveBitcoinScreen.tapQrCodeCopy")}</Text>}
        </View>
        <Button
          buttonStyle={styles.buttonStyle}
          disabledStyle={styles.buttonStyle}
          containerStyle={{marginHorizontal: 48, borderRadius: 24, marginTop: 18}}
          title={translate("common.share")}
          onPress={shareInvoice}
          titleStyle={{ fontWeight: "bold" }}
        />
    </Screen>
  )
})
