import Clipboard from "@react-native-community/clipboard"
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
import { request } from "../../utils/request"
import analytics from '@react-native-firebase/analytics'
import messaging from '@react-native-firebase/messaging';

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
  const store = React.useContext(StoreContext)

  // FIXME TODO add back a way to set a memo
  const [memo, setMemo] = useState("")

  const [amount, setAmount] = useState(0)
  const [loading, setLoading] = useState(false)

  const [networkIndex, setNetworkIndex] = useState(0)
  const [data, setData] = useState(" ")


  // a list of the hash that has been added to the receive bitcoin tab.
  // because we are creating a 
  // TODO: send notification from the server would be a better architecture
  const [hashes, setHashes] = useState([])
  const [counter, setCounter] = useState(0)


  useEffect(() => {
    update()
  }, [networkIndex])


  useEffect(() => {
    const requestPermission = async () => {
      const authorizationStatus = await messaging().requestPermission()

      const enabled = authorizationStatus === messaging.AuthorizationStatus.AUTHORIZED ||
                      authorizationStatus === messaging.AuthorizationStatus.PROVISIONAL;
  
      // Alert.alert(`enable: ${enabled ? 'true': 'false'}`)

      if (!enabled) {
        return
      }

      const token =  await messaging().getToken()
      store.mutateAddDeviceToken({deviceToken: token})

      // If using other push notification providers (ie Amazon SNS, etc)
      // you may need to get the APNs token instead for iOS:
      // if(Platform.OS == 'ios') { messaging().getAPNSToken().then(token => { return saveTokenToDatabase(token); }); }

      // Listen to whether the token changes
      messaging().onTokenRefresh(token => {
        store.mutateAddDeviceToken({deviceToken: token})
      });
    }

    const notifRequest = async () => {

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
          // we already have the token
          // TODO: look at what happen when a user change devices
          // if permission is given automatically or a not,
          // and whether a new token should be requested
          
      
          // TODO: this should not be needed
          // but there is no harm to sending the token multiple times for now
          requestPermission() 
          return
        }
  
        setTimeout(
        () => Alert.alert(
          "Notification", 
          "Do you want to activate notification to be notified when the payment has arrived?", 
        [
          {
            text: "Later",
            onPress: () => console.tron.log("Cancel/Later Pressed"),
            style: "cancel"
          },
          {
            text: translate("common.ok"),
            onPress: () => requestPermission()
          },
        ], { cancelable: true })
        , 5000)
  
      } else {
        // TODO move to move money or app.tsx?
        requestPermission()
      }
    }

    notifRequest()
  }, [])

  const update = async () => {
    if (networkIndex === 0) {
      await createInvoice()
    } else {
      const uri = `bitcoin:${values(store.lastOnChainAddresses)[0].id}`
      setData(amount === 0 ? uri : uri + `?amount=${amount * 10 ** 8}`)
    }
  }

  const copyInvoice = () => {
    Clipboard.setString(data)
    Alert.alert("Invoice has been copied in the clipboard")
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

  const createInvoice = async () => {
    setLoading(true)

    console.tron.log("createInvoice")

    let invoice

    try {
      const result = await store.mutateInvoice(
        {addInvoice: {value: amount, memo}},
        msg => msg.addInvoice
      )

      invoice = result.invoice.addInvoice
    } catch (err) {
      console.tron.log(`error with AddInvoice: ${err}`)
      throw err
    }

    try {
      const invoiceDecoded = lightningPayReq.decode(invoice)
      const hash = getHash(invoiceDecoded)
      setHashes(array => [...array, hash])

      console.tron.log({hash})
      
      setData(invoice)
    } catch (err) {
      Alert.alert(err.toString())
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    const fetchInvoice = async () => {
      try {

      // lightning
      const query = `mutation updatePendingInvoice($hash: String) {
        invoice {
          updatePendingInvoice(hash: $hash)
        }
      }`

      for (const hash of hashes) { 
        const result = await request(query, {hash})

        if (result.invoice.updatePendingInvoice === true) {
          success()
        }
      }
  
      // on-chain
      // TODO

      } catch (err) {
        console.tron.warn(`can't fetch invoice ${err}`)
      }
    }
  
    fetchInvoice()
  },  [counter])

  // this is to trigger the fetchInvoice function. not sure why we need the counter.
  // but running to issue without where hashes is not populated
  // as if it was taking the initial context but not 
  useEffect(() => {
    const interval = setInterval(() => {
      setCounter(counter => counter + 1)
    }, 2500)
    return () => clearInterval(interval)
  }, [])

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
    Alert.alert("success", "This invoice has been paid", [{
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
          {loading && <Text> </Text> || <Text>Tap QR Code to Copy</Text>}
        </View>
        <Button
          buttonStyle={styles.buttonStyle}
          disabledStyle={styles.buttonStyle}
          containerStyle={{marginHorizontal: 48, borderRadius: 24, marginTop: 18}}
          title="Share"
          onPress={shareInvoice}
          titleStyle={{ fontWeight: "bold" }}
        />
    </Screen>
  )
})
