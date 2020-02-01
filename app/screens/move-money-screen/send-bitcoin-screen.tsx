import * as React from "react"
import { useState, useEffect }from "react"
import { inject, observer } from "mobx-react"
import { Text, View, ViewStyle, Alert, Clipboard, StyleSheet } from "react-native"
import { Screen } from "../../components/screen"
import { Input, Button } from 'react-native-elements';
import Icon from "react-native-vector-icons/Ionicons"
import { color } from "../../theme";
import { RNCamera } from "react-native-camera";
import { withNavigation, ScrollView } from "react-navigation";
import { useNavigation, useNavigationParam } from "react-navigation-hooks";
import { palette } from "../../theme/palette"
import ReactNativeHapticFeedback from "react-native-haptic-feedback";
import { Onboarding } from "types"


const CAMERA: ViewStyle = {
    width: "100%",
    height: "100%",
}

const styles = StyleSheet.create({
    squareButton: {
      width: 70,
      height: 70,
      backgroundColor: color.primary,
    },

    smallText: {
        fontSize: 18,
        color: palette.darkGrey,
        textAlign: 'left',
        marginBottom: 10,
    },

    note: {
        fontSize: 18,
        color: palette.darkGrey,
        textAlign: 'left',
        marginLeft: 10,
    },

    horizontalContainer: {
        // flex: 1,
        flexDirection: "row",
    },

    icon: {
        marginRight: 15,
        color: palette.darkGrey
    },

    invoiceContainer: {
        flex: 1, alignSelf: "flex-end" 
    },

    buttonStyle: {
        backgroundColor: color.primary,
        marginHorizontal: 20,
        marginVertical: 8,
    },

    section: {
        paddingTop: 12,
        paddingBottom: 8,
        paddingHorizontal: 20,
    }

})


export const ScanningQRCodeScreen = withNavigation(
    ({ navigation }) => {

    const goBack = () => navigation.goBack()
    const callback = useNavigationParam('callbackQRCode')    

    return(
        <Screen>
            <RNCamera
                style={CAMERA}
                captureAudio={false}
                onBarCodeRead={event => {
                    const qr = event.data
                    callback(qr)
                    goBack()
                }}
            />
        </Screen>
    )
})

ScanningQRCodeScreen.navigationOptions = () => ({
    title: "Scan QR Code"
})

export const SendBitcoinScreen: React.FC
= inject("dataStore")(
  observer(({ dataStore }) => {

    const [invoice, setInvoice] = useState("")

    const [addr, setAddr] = useState("")
    const [amount, setAmount] = useState(0)
    const [amountless, setAmountless] = useState(false)
    const [message, setMessage] = useState("")
    const [err, setErr] = useState("")
    const [note, setNote] = useState(" ")
    const [loading, setLoading] = useState(false)

    const { navigate } = useNavigation()

    const callbackQRCode = async (data) => {
        decodeInvoice(data)
    }

    const pasteInvoice = async () => {
        decodeInvoice(await Clipboard.getString())
    }

    const decodeInvoice = async (data) => {
        try {
            let [protocol, request] = data.split(":")
            console.tron.log(protocol, request)
            if (protocol === "bitcoin") {
                Alert.alert("We're integrating Loop in. Use Lightning for now")
                return
            } else if (protocol.startsWith("ln") && request === undefined) { // it might start with 'lightning:'
                request = protocol

            } else if (protocol.toLowerCase() !== "lightning") {
                let message = `Only lightning procotol is accepted for now.`
                message += message === "" ? "" : `got: ${protocol}`
                Alert.alert(message)
                return
            }

            const payReq = await dataStore.lnd.decodePayReq(request)
            console.tron.log(payReq)
            setInvoice(request)
            setAddr(payReq.destination)

            if (payReq.numSatoshis) {
                setAmount(payReq.numSatoshis)
                setAmountless(false)
            } else {
                setAmount(0)
                setAmountless(true)
            }

            if (payReq.description) {
                setNote(payReq.description)
            } else {
                setNote(`invoice has no description`)
            }

        } catch (err) {
            Alert.alert(err.toString())
        }        
    }

    const openingCamera = () => {
        navigate('scanningQRCode', {callbackQRCode})
    }

    type payInvoiceResult = boolean | Error

    const payInvoice = async () => {
        const payreq = { paymentRequest: invoice }

        if (invoice === "") {
            Alert.alert(`You need to paste an invoice or scan a QR Code`)
            return
        }

        if (amountless) {
            if (amount === 0) {
                Alert.alert(`This invoice doesn't have an amount, `
                + `so you need to manually specify an amount`)
                return
            }

            payreq['amt'] = amount
        }

        console.tron.log('payreq', payreq)

        setLoading(true)
        try {
            const result:payInvoiceResult = await dataStore.lnd.payInvoice(payreq)

            console.tron.log(result)
            if (result === true) {
                setMessage('Payment succesfull')
                await dataStore.onboarding.add(Onboarding.firstLightningPayment)
                setInvoice("")
            } else {
                setErr(result.toString())
            }
        } catch(err) {
            setErr(err.toString())
        }
    }

    useEffect(() => {
        if (message !== "" || err !== "") {

          const header = err ? "error" : "success"

          const options = {
            enableVibrateFallback: true,
            ignoreAndroidSystemSettings: false
          };

          const haptic_feedback = err !== "" ? "notificationError" : "notificationSuccess"
          ReactNativeHapticFeedback.trigger(haptic_feedback, options)
          
          Alert.alert(header, message || err, [
            {
              text: "OK",
              onPress: () => {
                setLoading(false)
              },
            },
          ])
          setMessage("")
          setErr("")
        }
      }, [message, err])

    return (
        <Screen>
            <ScrollView>
                <View style={styles.section}>
                    <Text style={styles.smallText}>To</Text>
                    <View style={styles.horizontalContainer}>
                        <Input placeholder='Invoice' 
                            leftIcon={  <Icon   name='ios-log-out'
                                        size={24}
                                        color={color.primary}
                                        style={styles.icon}
                                        />} 
                            value={invoice}
                            containerStyle={styles.invoiceContainer}
                        />
                        <Button icon={<Icon
                            name="ios-camera"
                            size={48}
                            color={color.palette.white}/>}
                            buttonStyle={styles.squareButton}
                            onPress={openingCamera}
                        />
                    </View>
                </View>
                <View style={styles.section}>
                    <Text style={styles.smallText}>Amount</Text>
                    <Input leftIcon={<Text style={styles.icon}>sats</Text>}
                        onChangeText={input => setAmount(+input)}
                        value={amount.toString()}
                        disabled={!amountless}
                        returnKeyType='done'
                        keyboardType="number-pad" // TODO, there should be no keyboard here
                        />
                </View>
                <View style={styles.section}>
                    <Text style={styles.smallText}>Note</Text>
                    <Text style={styles.note}>{note}</Text>
                </View>
                <Button 
                    buttonStyle={styles.buttonStyle}
                    title="Paste" onPress={pasteInvoice}
                    />
                <Button 
                    buttonStyle={styles.buttonStyle}
                    title="Send" onPress={payInvoice}
                    disabled={invoice === ""}
                    loading={loading}
                    />
            </ScrollView>
        </Screen>
    )
}))

SendBitcoinScreen.navigationOptions = () => ({
    title: "Send Bitcoin"
})
