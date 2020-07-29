import * as lightningPayReq from "bolt11"
import { observer } from "mobx-react"
import * as React from "react"
import { useEffect, useState } from "react"
import { Alert, Clipboard, Dimensions, Share, StyleSheet, Text, View } from "react-native"
import { Button, Input } from "react-native-elements"
import { ScrollView } from "react-native-gesture-handler"
import ReactNativeHapticFeedback from "react-native-haptic-feedback"
import { IconTransaction } from "../../components/icon-transactions"
import { InputPaymentDataInjected } from "../../components/input-payment"
import { QRCode } from "../../components/qrcode"
import { Screen } from "../../components/screen"
import { translate } from "../../i18n"
import { StoreContext } from "../../models"
import { palette } from "../../theme/palette"
import { CurrencyType } from "../../utils/enum"
import { getHash } from "../../utils/lightning"
import { request } from "../../utils/request"

var width = Dimensions.get('window').width; //full width


const styles = StyleSheet.create({
  buttonStyle: {
    backgroundColor: palette.lightBlue,
    marginTop: 18,
    borderRadius: 32,
  },

  clearButtonStyle: {
    marginTop: 18,
    borderRadius: 32,
  },

  icon: {
    color: palette.darkGrey,
    marginRight: 15,
  },

  qr: {
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
})

export const ReceiveBitcoinScreen = observer(({ navigation }) => {
  const [memo, setMemo] = useState("")
  const [amount, setAmount] = useState(0)
  const [loading, setLoading] = useState(false)

  const createInvoice = async () => {
    setLoading(true)

    let invoice

    try {
      const query = `mutation addInvoice($amount: Int, $memo: String) {
        invoice {
          addInvoice(value: $amount, memo: $memo)
        }
      }`

      const result = await request(query, {amount, memo})
      console.tron.log({result})

      invoice = result.invoice.addInvoice
    } catch (err) {
      console.tron.log(`error with AddInvoice: ${err}`)
      throw err
    }

    try {
      const invoiceDecoded = lightningPayReq.decode(invoice)
      const hash = getHash(invoiceDecoded)

      navigation.navigate("showQRCode", { data: invoice, amount, hash, type: "lightning" })
    } catch (err) {
      Alert.alert(err.toString())
    } finally {
      setLoading(false)
    }
  }

  const getAddress = async () => {
    setLoading(true)

    let address

    try {
      const query = `mutation getNewAddress {
        onchain {
          getNewAddress
        }
      }`

      const result = await request(query)
      console.tron.log({result})

      address = result.onchain.getNewAddress
    } catch (err) {
      console.tron.log(`error with getAddress: ${err}`)
      throw err
    }

    try {
      navigation.navigate("showQRCode", { data: address, type: "onchain" })
    } catch (err) {
      Alert.alert(err.toString())
    } finally {
      setLoading(false)
    }
  }

  return (
    <Screen backgroundColor={palette.lighterGrey}>
      <ScrollView style={{ flex: 1, paddingTop: 32 }}>
        <View style={{ alignItems: "center" }}>
          <IconTransaction type={"receive"} size={75} color={palette.orange} />
        </View>
        <View style={styles.section}>
          <InputPaymentDataInjected 
            onUpdateAmount={amount => setAmount(amount)}
            onSubmitEditing={createInvoice}
          />
        </View>
        <View style={styles.section}>
          <Input placeholder="Optional note" value={memo} onChangeText={(text) => setMemo(text)} />
        </View>
        <View style={{ alignContent: "center", alignItems: "center", marginHorizontal: 48 }}>
          <Button
            buttonStyle={styles.buttonStyle}
            disabledStyle={styles.buttonStyle}
            containerStyle={{width: "100%"}}
            title="Create"
            onPress={createInvoice}
            titleStyle={{ fontWeight: "bold" }}
            loading={loading}
            disabled={loading}
          />
          <Button
            buttonStyle={styles.clearButtonStyle}
            titleStyle={{color: palette.lightBlue, fontWeight: "bold" }}
            containerStyle={{width: "100%"}}
            title="On chain?"
            type="clear"
            onPress={getAddress}
            loading={loading}
            disabled={loading}
          />
        </View>
      </ScrollView>
    </Screen>
  )
})

export const ShowQRCode = ({ route, navigation }) => {
  const data = route.params.data
  const type = route.params.type
  const hash = route.params.hash
  const amount = route.params.amount

  const store = React.useContext(StoreContext)

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

  const copyInvoice = () => {
    Clipboard.setString(data)
    Alert.alert("Invoice has been copied in the clipboard")
  }

  useEffect(() => {
    const interval = setInterval(async () => {
      try {

        if (type === "lightning") {
          const query = `mutation updatePendingInvoice($hash: String) {
            invoice {
              updatePendingInvoice(hash: $hash)
            }
          }`
    
          const result = await request(query, {hash})
    
          if (result.invoice.updatePendingInvoice === true) {
            success()
          }
        }

        if (type === "onchain") {
          // TODO
        }

      } catch (err) {
        console.tron.warn(`can't ferch invoice ${err}`)
      }
    }, 2000)
    return () => clearInterval(interval)
  }, [])

  const success = () => {
    const options = {
      enableVibrateFallback: true,
      ignoreAndroidSystemSettings: false,
    }

    store.queryWallet()

    ReactNativeHapticFeedback.trigger("notificationSuccess", options)
    Alert.alert("success", "This invoice has been paid", [
      {
        text: translate("common.ok"),
        onPress: () => {
          navigation.goBack(false)
        },
      },
    ])
  }

  return (
    <Screen backgroundColor={palette.lighterGrey}>
      <ScrollView style={{ flex: 1, paddingTop: 32 }}>
        <View style={{ alignItems: "center" }}>
          <IconTransaction type={"receive"} size={75} color={palette.orange} />
        </View>
        <QRCode style={styles.qr} size={280}>
          {data}
        </QRCode>
        <View style={{ marginHorizontal: 48 }}>
          {type === "lightning" &&
            <Text style={{ fontSize: 16, alignSelf: "center" }}>
              Receive {amount} sats / ${(amount * store.rate(CurrencyType.BTC)).toFixed(2)}
            </Text>
          }
          <Button
            buttonStyle={styles.buttonStyle}
            disabledStyle={styles.buttonStyle}
            containerStyle={{width: "100%"}}
            title="Share"
            onPress={shareInvoice}
            titleStyle={{ fontWeight: "bold" }}
          />
          <Button
            buttonStyle={styles.buttonStyle}
            disabledStyle={styles.buttonStyle}
            containerStyle={{width: "100%"}}
            title="Copy"
            onPress={copyInvoice}
            titleStyle={{ fontWeight: "bold" }}
          />
        </View>
      </ScrollView>
    </Screen>
  )
}
