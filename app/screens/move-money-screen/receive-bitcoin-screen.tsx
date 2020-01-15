import * as React from "react"
import { useState } from "react"
import { inject, observer } from "mobx-react"
import { Text, View, Alert, Share, Clipboard, StyleSheet } from "react-native"
import { Screen } from "../../components/screen"
import { Input, Button, ButtonGroup } from 'react-native-elements';
import { color } from "../../theme";
import { useNavigation } from "react-navigation-hooks";
import { QRCode } from "../../components/qrcode"
import { ScrollView } from "react-native-gesture-handler"


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

    const [note, setNote] = useState("")
    const [amount, setAmount] = useState(0)

    const { navigate } = useNavigation()

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

    const createInvoice = () => {
        dataStore.lnd.addInvoice({value: amount, memo: note})
    }

    return (
        <Screen>
          <ScrollView style={{flex: 1}}>
            <ButtonGroup
            onPress={updateIndex}
            buttons={buttons}
            containerStyle={{height: 50}}
            />
            <QRCode style={styles.qr} size={300}>{dataStore.lnd.lastAddInvoice}</QRCode>
            <View>
                <Text>Note</Text>
                <Input placeholder='Optional' 
                    value={note} onChangeText={text => setNote(text)}
                    />
            </View>
            <View>
                <Text>Amount</Text>
                <Input placeholder="0" 
                    value={isNaN(amount) ? '0' : amount.toString()} 
                    onChangeText={text => setAmount(parseFloat(text))}
                    keyboardType="numeric"
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

