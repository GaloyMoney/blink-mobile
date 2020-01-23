import * as React from "react"
import { useState, useEffect } from "react"
import { inject, observer } from "mobx-react"
import { Text, View, Alert, Share, Clipboard, StyleSheet } from "react-native"
import { Screen } from "../../components/screen"
import { Input, Button, ButtonGroup } from 'react-native-elements';
import { color } from "../../theme";
import { QRCode } from "../../components/qrcode"
import { ScrollView } from "react-native-gesture-handler"
import ReactNativeHapticFeedback from "react-native-haptic-feedback";
import { palette } from "../../theme/palette"

const styles = StyleSheet.create({
  qr: {
    alignItems: "center",
    flex: 1,
  },

  buttonStyle: {
    backgroundColor: color.primary, flex: 1, width: 120, margin: 5
  },

  smallText: {
    fontSize: 18,
    color: palette.darkGrey,
    textAlign: 'left',
    marginBottom: 10,
  },

  section: {
    paddingTop: 8,
    paddingBottom: 8,
    paddingHorizontal: 20,
  }

})


export const ReceiveBitcoinScreen: React.FC = inject("dataStore")(observer(
    ({ dataStore }) => {

    const [note, setNote] = useState("")
    const [amount, setAmount] = useState(0)

    const buttons = ['Lightning', 'On-chain']

    const updateIndex = (index) => {
        console.tron.log('index: ', index)
        if (index ==! 0) {
            Alert.alert('On-chain provided in future version')
        } 
    }

    const shareInvoice = async () => {
        try {
          const result = await Share.share({
            message: dataStore.lnd.lastAddInvoice,
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
        Clipboard.setString(dataStore.lnd.lastAddInvoice)
    }

    const createInvoice = async () => {
      await dataStore.lnd.addInvoice({value: amount, memo: note})
    }

    // Note: we could not remove the invoice here, and 
    // fetch back the amount detail as we are remounting the 
    // invoice based on decodepayreq 
    useEffect(() => { // unmount
      return () => {
        dataStore.lnd.clearLastInvoice()
      }
    }, []);

    useEffect(() => { // new invoice, is it ours?
      if (dataStore.lnd.receiveBitcoinScreenAlert === false) {
        return
      }
      
      const options = {
        enableVibrateFallback: true,
        ignoreAndroidSystemSettings: false
      }

      // TODO refactor
      ReactNativeHapticFeedback.trigger("notificationSuccess", options)
      
      Alert.alert("success", "This invoice has been paid")

      setNote("")
      setAmount(0)

      dataStore.lnd.resetReceiveBitcoinScreenAlert()
  
    }, [dataStore.lnd.receiveBitcoinScreenAlert]);

    return (
        <Screen>
          <ScrollView style={{flex: 1}}>
            <ButtonGroup
            selectedIndex={0}
            onPress={updateIndex}
            buttons={buttons}
            selectedButtonStyle={{backgroundColor: color.primary}}
            />
            {(dataStore.lnd.lastAddInvoice !== "") &&
              <QRCode style={styles.qr} size={300}>{dataStore.lnd.lastAddInvoice}</QRCode>
            }
            <View style={styles.section}>
                <Text  style={styles.smallText}>Note</Text>
                <Input placeholder='Optional' 
                    value={note} onChangeText={text => setNote(text)}
                    />
            </View>
            <View style={styles.section}>
                <Text style={styles.smallText}>Amount</Text>
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

