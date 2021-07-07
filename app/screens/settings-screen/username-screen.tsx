/* eslint-disable react-native/no-unused-styles */
import { gql, useLazyQuery, useMutation } from "@apollo/client"
import { useIsFocused } from "@react-navigation/native"
import * as React from "react"
import { ActivityIndicator, Alert, Text } from "react-native"
import { Input } from "react-native-elements"
import EStyleSheet from "react-native-extended-stylesheet"
import { Screen } from "../../components/screen"
import { USERNAME_EXIST } from "../../graphql/query"
import { translate } from "../../i18n"
import { color } from "../../theme"

// TODO: memoize dynamic styles
const styles = (error = false) =>
  EStyleSheet.create({
    activity: { marginTop: 12 },

    // eslint-disable-next-line react-native/no-color-literals
    error: { color: error ? "red" : "green" },

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

type Props = {
  navigation: Record<string, any>
}

export const UsernameScreen = ({ navigation }: Props) => {
  const [loading, setLoading] = React.useState(false)
  const [input, setInput] = React.useState("")
  const [message, setMessage] = React.useState("")
  const [messageIsError, setMessageIsError] = React.useState(false)

  // we don't show a error message before the user had a change to add 3 caracters
  const [init, setInit] = React.useState(true)

  // TODO use a debouncer to avoid flickering https://github.com/helfer/apollo-link-debounce
  const [usernameExistsQuery, { loading: loadingUserNameExist, data }] = useLazyQuery(
    USERNAME_EXIST,
    { fetchPolicy: "cache-and-network" },
  )

  const usernameExists = data?.usernameExists ?? false

  const [updateUsername] = useMutation(gql`
    mutation updateUsername($username: String!) {
      updateUser {
        updateUsername(username: $username) {
          id
          username
        }
      }
    }
  `)

  React.useEffect(() => {
    const isValid = assertValidInput()

    if (!isValid) {
      return
    }

    usernameExistsQuery({ variables: { username: input } })
  }, [input])

  React.useEffect(() => {
    if (init && input.length <= 2) {
      return
    }

    const isValid = assertValidInput()

    if (!isValid) {
      return
    }

    if (usernameExists) {
      setMessage(translate("UsernameScreen.notAvailable", { input }))
      setMessageIsError(true)
    } else {
      setMessage(translate("UsernameScreen.available", { input }))
      setMessageIsError(false)
    }
  }, [data, input])

  const send = async () => {
    setLoading(true)
    console.log("createInvoice")
    try {
      const { data } = await updateUsername({ variables: { username: input } })
      const success = data?.updateUser?.updateUsername

      if (!success) {
        console.warn("issue setting up username")
      }

      Alert.alert(
        translate("UsernameScreen.success", { input }),
        // translate("UsernameScreen.confirmSubtext"),
        null,
        [
          {
            text: translate("common.ok"),
            onPress: () => {
              navigation.goBack()
              navigation.goBack()
            },
          },
        ],
      )
    } catch (err) {
      console.error(err, "error with updateUsername")
      setMessage(`${err}`)
      setMessageIsError(true)
    } finally {
      setLoading(false)
    }
  }

  const isFocused = useIsFocused()

  const assertValidInput = (): boolean => {
    if (input.length <= 2) {
      setMessage(translate("UsernameScreen.3CaractersMinimum"))
      setMessageIsError(true)
      inputForm.current.focus()
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
    console.log("validate")

    if (!isFocused) {
      return
    }

    setInit(false)
    const isValid = assertValidInput()

    if (!isValid) {
      return
    }

    if (usernameExists) {
      inputForm.current.focus()
    } else {
      Alert.alert(
        translate("UsernameScreen.confirmTitle", { input }),
        translate("UsernameScreen.confirmSubtext"),
        [
          {
            text: translate("common.cancel"),
            onPress: () => console.log("Cancel Pressed"),
            style: "cancel",
          },
          { text: translate("common.ok"), onPress: send },
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

  const inputForm = React.createRef()

  return (
    <Screen preset="scroll" style={styles().screenStyle}>
      <Text style={styles().text}>{translate("UsernameScreen.usernameToUse")}</Text>
      <Input
        ref={inputForm}
        autoFocus
        placeholder={translate("common.username")}
        leftIcon={{ type: "ionicon", name: "ios-person-circle" }}
        onChangeText={onChangeText}
        errorStyle={styles(messageIsError).error}
        errorMessage={message}
        maxLength={20}
        returnKeyType="send"
        textContentType="username"
        onBlur={validate}
        autoCompleteType="username"
        autoCapitalize="none"
      />
      {/* <Button
      style={{marginTop: 24}}
      title="Send"
    /> */}
      <ActivityIndicator
        animating={loading}
        size="large"
        color={color.primary}
        style={styles().activity}
      />
    </Screen>
  )
}
