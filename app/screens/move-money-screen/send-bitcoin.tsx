import * as React from "react"
import { useState }from "react"
import { inject, observer } from "mobx-react"
import { Text, View, ViewStyle, Alert } from "react-native"
import { Screen } from "../../components/screen"
import { Input, Button } from 'react-native-elements';
import Icon from "react-native-vector-icons/Ionicons"
import { color } from "../../theme";
import { RNCamera } from "react-native-camera";
import { NavigationActions, withNavigation } from "react-navigation";
import { useNavigation, useNavigationParam } from "react-navigation-hooks";


const CAMERA: ViewStyle = {
    width: "100%",
    height: "100%",
}

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
    const [addr, setAddr] = useState("")
    const [amount, setAmount] = useState(0)

    const { navigate } = useNavigation()

    const callbackQRCode = (data) => {
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

            

        } catch (err) {
            Alert.alert(err)
        }
    }

    const openingCamera = () => {
        console.tron.log('opening Camera')
        navigate('scanningQRCode', {callbackQRCode})
    }

    return (
        <Screen>
            <Text>To</Text>
            <View>
                <Input placeholder='Address or Invoice' 
                leftIcon={<Icon name='ios-log-out' size={24} color={color.primary} />}
                />
                <Button icon={<Icon
                    name="ios-camera"
                    size={48}
                    color={color.palette.white} />}
                buttonStyle={{backgroundColor: color.primary}}
                onPress={openingCamera}
                />
            </View>
            <Text>Amount</Text>
            <Input leftIcon={<Text>sats</Text>} />
            <Button 
                buttonStyle={{backgroundColor: color.primary}}
                title="Send"
                />
            <Text>{qr}</Text>
        </Screen>
    )
}))