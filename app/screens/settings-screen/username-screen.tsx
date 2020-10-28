import * as React from "react"
import { ActivityIndicator, Alert, Text } from "react-native"
import { Input } from "react-native-elements"
import EStyleSheet from 'react-native-extended-stylesheet'
import { Screen } from "../../components/screen"
import { translate } from "../../i18n"
import { color } from "../../theme"

const styles = EStyleSheet.create({
  screenStyle: {
    marginHorizontal: 48,
    // marginVertical: 24,
  },

  text: {
    fontSize: "16rem",
    paddingVertical: "18rem",
    textAlign: "center",
  },


})

export const UsernameScreen = ({}) => {

  const [loading, setLoading] = React.useState(false)
  const [input, setInput] = React.useState("")
  const [available, setAvailable] = React.useState(false)
  const [message, setMessage] = React.useState("")

  const send = async () => {
    setLoading(true)

    try {

    } catch (err) {

    } finally {
      setLoading(false)
    }
  }

  const validate = async () => {
    if (input?.length <= 2 ?? true) {
      setAvailable(false)
      setMessage("UsernameScreen.3CaractersMinimum")
    }

    Alert.alert(
      translate("UsernameScreen.confirmTitle", {input}),
      translate("UsernameScreen.confirmSubtext"),
      [
        {
          text: translate("common.cancel"),
          onPress: () => console.tron.log("Cancel Pressed"),
          style: "cancel"
        },
        { text: translate("common.ok"), onPress: send }
      ],
    )
  }

  const onChangeText = (value) => {
    setInput(value)

    if (value?.length <= 2 ?? false) {
      return
    }

    if (value === "toto") {
      setAvailable(false)
      setMessage(translate("UsernameScreen.notAvailable"))
    }

    setAvailable(true)
    setMessage(translate("UsernameScreen.available"))
  }

  // const input = React.createRef();
  // input.current.focus();

  return (
  <Screen preset="scroll" style={styles.screenStyle}>
    <Text style={styles.text}>{translate("UsernameScreen.usernameToUse")}</Text>
    <Input
      // ref={input}
      autoFocus={true}
      placeholder='myUsernameScreen'
      leftIcon={{ type: 'ionicon' , name: 'ios-person-circle' }}
      onChangeText={onChangeText}
      errorStyle={{ color: available ? 'green' : 'red' }}
      errorMessage={message}
      maxLength={20}
      returnKeyType={"send"}
      textContentType={"username"}
      onBlur={validate}
    />
    {/* <Button
      style={{marginTop: 24}}
      title="Send"
    /> */}
    <ActivityIndicator animating={loading} size="large" color={color.primary} style={{marginTop: 12}} />

  </Screen>
)}