import * as React from "react"
import { useState }from "react"
import { inject, observer } from "mobx-react"
import { Text, View, ViewStyle, Alert } from "react-native"
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
            <Text>{error}</Text>
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

    const [qr, setQr] = useState("")
    const [invoice, setInvoice] = useState("")
    const [addr, setAddr] = useState("")
    const [amount, setAmount] = useState(0)
    const [loading, setLoading] = useState(false)

    const { navigate } = useNavigation()

    const callbackQRCode = async (data) => {
        try {
            setQr(data)
            const [protocol, request] = qr.split(":")
            if (protocol === "bitcoin") {
                Alert.alert("We're integrating Loop in. Use Lightning for now")
                return
            } else if (protocol !== "lightning") {
                Alert.alert(
                    `Only QR code procol are accepted for now. scanned ${protocol}`)
                return
            }
            setInvoice(request)
            await decodeInvoice()
        } catch (err) {
            Alert.alert(err)
        }
    }

    const decodeInvoice = async () => {
        try {
            const payReq = await dataStore.lnd.decodePayReq(invoice)
            console.tron.log(payReq)
            setAddr(payReq.destination)
            setAmount(payReq.numSatoshis)
        } catch (err) {
            Alert.alert(err)
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
            if (result) {
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
            <Text>To</Text>
            <View>
                <Input placeholder='Address or Invoice' 
                    leftIcon={  <Icon   name='ios-log-out'
                                size={24}
                                color={color.primary} />} 
                    value={addr}
                />
                <Button icon={<Icon
                    name="ios-camera"
                    size={48}
                    color={color.palette.white} />}
                buttonStyle={{backgroundColor: color.primary}}
                onPress={openingCamera}
                />
            </View>
            <Text>{amount}</Text>
            <Input leftIcon={<Text>sats</Text>} />
            <Button 
                buttonStyle={{backgroundColor: color.primary}}
                title="Send" onPress={payInvoice}
                />
            <Input value={invoice} onChangeText={value => {setInvoice(value)}} />
            <Button title="Decode Invoice" onPress={decodeInvoice} />
            <Text>{qr}</Text>
        </Screen>
    )
}))
