import * as React from "react"
import { useState } from "react"
import { inject, observer } from "mobx-react"
import { Text, View, Alert, Share, Clipboard, StyleSheet } from "react-native"
import { Screen } from "../../components/screen"
import { Input, Button, ButtonGroup } from 'react-native-elements';
import { color } from "../../theme";
import { QRCode } from "../../components/qrcode"
import { ScrollView } from "react-native-gesture-handler"
import ReactNativeHapticFeedback from "react-native-haptic-feedback";
import { when } from "mobx"
import { toHex } from "../../utils/helper"
import { useNavigation } from "react-navigation-hooks"


const styles = StyleSheet.create({
  qr: {
    alignItems: "center",
    flex: 1,
  },

  buttonStyle: {
    backgroundColor: color.primary, flex: 1, width: 120, margin: 5
  }
})


export const ReceiveBitcoinScreen: React.FC
= inject("dataStore")(
  observer(({ dataStore }) => {

    const { navigate } = useNavigation()

    const [note, setNote] = useState("")
    const [amount, setAmount] = useState(0)
    const [invoice, setInvoice] = useState("")
    const [hash, setHash] = useState("")

    const buttons = ['Lightning', 'On-chain']

    const updateIndex = (index) => {
        console.tron.log('index: ', index)
        if (index ==! 0) {
            Alert.alert('Only lightning transaction for now')
        } 
    }

    const shareInvoice = async () => {
        try {
          const result = await Share.share({
            message: invoice,
          });
    
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
          Alert.alert(error.message);
        }
      };

    const copyInvoice = () => {
        Clipboard.setString(invoice)
    }

    const createInvoice = async () => {
      const response = await dataStore.lnd.addInvoice({value: amount, memo: note})
      setInvoice(response.paymentRequest)
      setHash(toHex(response.rHash))
    }

    const invoicePaid = () => {
      const options = {
        enableVibrateFallback: true,
        ignoreAndroidSystemSettings: false
      }

      // TODO refactor
      ReactNativeHapticFeedback.trigger("notificationSuccess", options)
      
      Alert.alert("success", "this invoice has been paid",
      [{
          text: "OK",
          onPress: () => {
            navigate('moveMoney')    
          },
        },
      ])
    }

    when(() => hash !== "" && hash == dataStore.lnd.lastSettleInvoiceHash,
      invoicePaid)

    return (
        <Screen>
          <ScrollView style={{flex: 1}}>
            <ButtonGroup
            onPress={updateIndex}
            buttons={buttons}
            containerStyle={{height: 50}}
            />
            {(invoice !== "") &&
              <QRCode style={styles.qr} size={300}>{invoice}</QRCode>
            }
            <View>
                <Text>Note</Text>
                <Input placeholder='Optional' 
                    value={note} onChangeText={text => setNote(text)}
                    />
            </View>
            <View>
                <Text>Amount</Text>
                <Input placeholder="0" 
                    value={amount.toString()}
                    onChangeText={input => setAmount(+input)}
                    returnKeyType='done'
                    keyboardType="number-pad"
                    />
            </View>
            <View style={{flexDirection: "row", margin: 10}}>
              <Button 
                  buttonStyle={styles.buttonStyle}
                  title="Create" onPress={createInvoice}
                  />
              <Button 
                  buttonStyle={styles.buttonStyle}
                  title="Share" onPress={shareInvoice}
                  />
              <Button 
                  buttonStyle={styles.buttonStyle}
                  title="Copy" onPress={copyInvoice}
                  />
            </View>
          </ScrollView>
        </Screen>
    )
}))

ReceiveBitcoinScreen.navigationOptions = () => ({
  title: "Receive Bitcoin"
})

