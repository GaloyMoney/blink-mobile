/* eslint-disable react-native/no-unused-styles */
import { gql, useLazyQuery, useMutation } from "@apollo/client"
import { useIsFocused } from "@react-navigation/native"
import { StackNavigationProp } from "@react-navigation/stack"
import * as React from "react"
import { useEffect, useState } from "react"
import { ActivityIndicator, Alert, Text } from "react-native"
import { TextInput } from "react-native-vector-icons/node_modules/@types/react-native/index"
import { Input } from "react-native-elements"
import EStyleSheet from "react-native-extended-stylesheet"

import { Screen } from "../../components/screen"
import { USERNAME_EXIST } from "../../graphql/query"
import { translate } from "../../i18n"
import { color } from "../../theme"
import { UsernameValidation } from "../../utils/validation"
import type { ScreenType } from "../../types/jsx"
import type { RootStackParamList } from "../../navigation/stack-param-lists"

// TODO: memoize dynamic styles
const styles = (error = false) =>
  EStyleSheet.create({
    activity: { marginTop: 12 },

    // eslint-disable-next-line react-native/no-color-literals
    error: { color: error ? "red" : "green" },

    screenStyle: {
      marginHorizontal: 48,
    },

    text: {
      fontSize: "16rem",
      paddingVertical: "18rem",
      textAlign: "center",
    },
  })

type Props = {
  navigation: StackNavigationProp<RootStackParamList, "setUsername">
}

export const UsernameScreen: ScreenType = ({ navigation }: Props) => {
  const [loading, setLoading] = useState(false)
  const [input, setInput] = useState("")
  const [message, setMessage] = useState("")
  const [messageIsError, setMessageIsError] = useState(false)
  const [
    shouldShowCharacterMinimumErrorMessage,
    setShouldShowCharacterMinimumErrorMessage,
  ] = useState(false)

  // TODO use a debouncer to avoid flickering https://github.com/helfer/apollo-link-debounce
  const [usernameExistsQuery, { loading: loadingUserNameExist, data }] = useLazyQuery(
    USERNAME_EXIST,
    { fetchPolicy: "cache-and-network" },
  )

  const usernameExists = data?.usernameExists ?? false

  const inputForm = React.createRef<TextInput>()

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

  useEffect(() => {
    if (!UsernameValidation.isValid(input)) {
      return
    }

    usernameExistsQuery({ variables: { username: input } })
  }, [input, usernameExistsQuery])

  useEffect(() => {
    if (!UsernameValidation.hasValidLength(input)) {
      if (shouldShowCharacterMinimumErrorMessage) {
        setMessage(translate("UsernameScreen.3CharactersMinimum"))
        setMessageIsError(true)
      }
      inputForm.current.focus()
      return
    }

    if (!UsernameValidation.hasValidCharacters(input)) {
      setMessage(translate("UsernameScreen.letterAndNumber"))
      setMessageIsError(true)
      return
    }

    if (usernameExists) {
      setMessage(translate("UsernameScreen.notAvailable", { input }))
      setMessageIsError(true)
    } else {
      setMessage(translate("UsernameScreen.available", { input }))
      setMessageIsError(false)
    }
  }, [data, input, inputForm, shouldShowCharacterMinimumErrorMessage, usernameExists])

  const send = async () => {
    setLoading(true)

    try {
      const { data } = await updateUsername({ variables: { username: input } })
      const success = data?.updateUser?.updateUsername

      if (!success) {
        console.warn("issue setting up username")
      }

      Alert.alert(translate("UsernameScreen.success", { input }), null, [
        {
          text: translate("common.ok"),
          onPress: () => {
            navigation.pop(2)
          },
        },
      ])
    } catch (err) {
      console.error(err, "error with updateUsername")
      setMessage(`${err}`)
      setMessageIsError(true)
    } finally {
      setLoading(false)
    }
  }

  const isFocused = useIsFocused()

  const validate = async () => {
    if (!isFocused) {
      return
    }

    setShouldShowCharacterMinimumErrorMessage(true)

    if (!UsernameValidation.isValid(input)) {
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

    if (!shouldShowCharacterMinimumErrorMessage && value.length > 2) {
      setShouldShowCharacterMinimumErrorMessage(true)
    }
  }

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
        errorMessage={loadingUserNameExist ? "" : message}
        maxLength={20}
        returnKeyType="send"
        textContentType="username"
        onBlur={validate}
        autoCompleteType="username"
        autoCapitalize="none"
      />
      <ActivityIndicator
        animating={loading}
        size="large"
        color={color.primary}
        style={styles().activity}
      />
    </Screen>
  )
}
