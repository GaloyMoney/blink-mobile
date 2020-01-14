import * as React from "react"
import { useState }from "react"
import { inject, observer } from "mobx-react"
import { Text, View, ViewStyle, Alert, Clipboard, StyleSheet } from "react-native"
import { Screen } from "../../components/screen"
import { Input, Button } from 'react-native-elements';
import Icon from "react-native-vector-icons/Ionicons"
import { color } from "../../theme";
import { RNCamera } from "react-native-camera";
import { withNavigation } from "react-navigation";
import { useNavigation, useNavigationParam } from "react-navigation-hooks";
import { Loader } from "../../components/loader"


const CAMERA: ViewStyle = {
    width: "100%",
    height: "100%",
}

const styles = StyleSheet.create({
    squareButton: {
      width: 80,
      height: 80,
      backgroundColor: color.primary
    },
})

export const SuccessPayInvoiceScreen = withNavigation(
    ({ navigation }) => {

    const goBack = () => navigation.goBack()

    return(
        <Screen>
            <Text>Payment succesfull!</Text>
            <Button onPress={goBack}>Go back</Button>
        </Screen>
    )
})

export const FailurePayInvoiceScreen = withNavigation(
    ({ navigation }) => {

    const goBack = () => navigation.goBack()
    const error = useNavigationParam('error')

    return(
        <Screen>
            <Text>Payment failed!</Text>
            <Text>{error.toString()}</Text>
            <Button onPress={goBack}>Go back</Button>
        </Screen>
    )
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

            } else if (protocol !== "lightning") {
                Alert.alert(
                    `Only lightning procotol is accepted for now. scanned ${protocol} protocol`)
                return
            }

            const payReq = await dataStore.lnd.decodePayReq(request)
            console.tron.log(payReq)
            setInvoice(request)
            setAddr(payReq.destination)
            setAmount(payReq.numSatoshis)

        } catch (err) {
            Alert.alert(err.toString())
        }        
    }

    const openingCamera = () => {
        navigate('scanningQRCode', {callbackQRCode})
    }

    type payInvoiceResult = boolean | Error

    const payInvoice = async () => {
        setLoading(true)
        try {
            const result:payInvoiceResult = await dataStore.lnd.payInvoice(invoice)
            console.tron.log(result)
            // TODO FIXME: error is not managed correctly
            if (result === true) {
                navigate('successPayInvoice')
            } else {
                navigate('failurePayInvoice', {error: result})
            }
        } finally {
            setLoading(false)
        }
    }

    return (
        <Screen>
            <Loader loading={loading} />
            <Text>Amount</Text>
            <Input leftIcon={<Text>sats</Text>} 
                onChangeText={input => setAmount(parseInt(input))}
                value={amount.toString()}
                />
            <Text>To</Text>
            <View>
                <Input placeholder='Invoice' 
                    leftIcon={  <Icon   name='ios-log-out'
                                size={24}
                                color={color.primary} />} 
                    value={invoice}
                />
                <Button icon={<Icon
                    name="ios-copy"
                    size={48}
                    color={color.palette.white} />}
                buttonStyle={styles.squareButton}
                onPress={pasteInvoice}
                />
                <Button icon={<Icon
                    name="ios-camera"
                    size={48}
                    color={color.palette.white} />}
                    buttonStyle={styles.squareButton}
                onPress={openingCamera}
                />
            </View>
            <Button 
                buttonStyle={{backgroundColor: color.primary}}
                title="Send" onPress={payInvoice}
                />
            {/* <Button title="Decode Invoice" onPress={decodeInvoice} /> */}
        </Screen>
    )
}))

SendBitcoinScreen.navigationOptions = () => ({
    title: "Send Bitcoin"
})
