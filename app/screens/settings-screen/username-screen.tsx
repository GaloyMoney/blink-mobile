import * as React from "react"
import { ActivityIndicator, Alert, Keyboard, Text } from "react-native"
import { Input } from "react-native-elements"
import EStyleSheet from 'react-native-extended-stylesheet'
import { Screen } from "../../components/screen"
import { translate } from "../../i18n"
import { useQuery } from "../../models"
import { color } from "../../theme"
import { useIsFocused } from '@react-navigation/native';

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

export const UsernameScreen = ({navigation}) => {

  const [loading, setLoading] = React.useState(false)
  const [input, setInput] = React.useState("")
  const [message, setMessage] = React.useState("")
  const [messageIsError, setMessageIsError] = React.useState(false)


  // we don't show a error message before the user had a change to add 3 caracters
  const [init, setInit] = React.useState(true)

  const { store, error: errorQuery, loading: loadingUserNameExist, data, setQuery, query } = useQuery()

  const exists = data?.usernameExists ?? false

  if (errorQuery) {
    console.tron.log({errorQuery})
  }

  React.useEffect(() => {
    const isValid = assertValidInput()

    if (!isValid) {
      return
    }
  
    setQuery((store) => store.queryUsernameExists({username: input}, {fetchPolicy: "cache-first"}))
  }, [input])

  React.useEffect(() => {
    // console.tron.log({query}, "query")

    query?.refetch()
  }, [query])

  React.useEffect(() => {
    if (init && input.length <= 2) {
      return
    }

    const isValid = assertValidInput()

    if (!isValid) {
      return
    }

    if (exists) {
      setMessage(translate("UsernameScreen.notAvailable", {input}))
      setMessageIsError(true)
    } else {
      setMessage(translate("UsernameScreen.available", {input}))
      setMessageIsError(false)
    }
  }, [data, input])

  const send = async () => {
    setLoading(true)
    console.tron.log("createInvoice")
    try {
      const query = `mutation updateUser_setUsername($username: String!) {
        updateUser {
          setUsername(username: $username)
        }
      }`

      const result = await store.mutate(query, { username: input })
      const success = result.updateUser.setUsername
      console.tron.log({result, success}, "username correctly set")

      setQuery(store.mainQuery())

      Alert.alert(
        translate("UsernameScreen.success", {input}),
        // translate("UsernameScreen.confirmSubtext"),
        null,
        [
          { text: translate("common.ok"), onPress: () => {
            navigation.goBack()
            navigation.goBack()
          }}
        ],
      )

    } catch (err) {
      console.tron.log(`error with setUsername: ${err}`)
      setMessage(`${err}`)
      setMessageIsError(true)
    } finally {
      setLoading(false)
    }
  }

  const isFocused = useIsFocused();


  const assertValidInput = (): boolean => {
    if (input.length <= 2) {
      setMessage(translate("UsernameScreen.3CaractersMinimum"))
      setMessageIsError(true)
      inputForm.current.focus();
      return false
    }

    const regexResult = new RegExp(/^[0-9a-z_]+$/i).test(input)
    if (!regexResult) {
      setMessage(translate("UsernameScreen.letterAndNumber"))
      setMessageIsError(true)
      return false
    }

    return true
  }

  const validate = async () => {
    console.tron.log("validate")

    if (!isFocused) {
      return
    }

    setInit(false)
    const isValid = assertValidInput()

    if (!isValid) {
      return
    }

    if (exists) {
      inputForm.current.focus();
    } else {
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
  }

  const onChangeText = (value) => {
    setInput(value)

    if (init) {
      return
    }

    if (value.length > 2) {
      setInit(false)
    }
  }

  const inputForm = React.createRef();

  return (
  <Screen preset="scroll" style={styles.screenStyle}>
    <Text style={styles.text}>{translate("UsernameScreen.usernameToUse")}</Text>
    <Input
      ref={inputForm}
      autoFocus={true}
      placeholder={translate('common.username')}
      leftIcon={{ type: 'ionicon' , name: 'ios-person-circle' }}
      onChangeText={onChangeText}
      errorStyle={{ color: messageIsError ? 'red' : 'green' }}
      errorMessage={message}
      maxLength={20}
      returnKeyType={"send"}
      textContentType={"username"}
      onBlur={validate}
      autoCompleteType="username"
      autoCapitalize="none"
    />
    {/* <Button
      style={{marginTop: 24}}
      title="Send"
    /> */}
    <ActivityIndicator animating={loading} size="large" color={color.primary} style={{marginTop: 12}} />

  </Screen>
)}