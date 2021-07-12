/* eslint-disable react-native/no-unused-styles */
import { gql, useLazyQuery, useMutation } from "@apollo/client"
import { useIsFocused } from "@react-navigation/native"
import * as React from "react"
import { useEffect, useState } from "react"
import { ActivityIndicator, Alert, Text, TextInput } from "react-native"
import { Input } from "react-native-elements"
import EStyleSheet from "react-native-extended-stylesheet"

import { Screen } from "../../components/screen"
import { USERNAME_EXIST } from "../../graphql/query"
import { translate } from "../../i18n"
import { color } from "../../theme"
import { ScreenType } from "../../types/screen"

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
  navigation: Record<string, any>
}

export const UsernameScreen: ScreenType = ({ navigation }: Props) => {
  const [loading, setLoading] = useState(false)
  const [input, setInput] = useState("")
  const [message, setMessage] = useState("")
  const [messageIsError, setMessageIsError] = useState(false)
  const [shouldShowErrorMessage, setShouldShowErrorMessage] = useState(false)

  // TODO use a debouncer to avoid flickering https://github.com/helfer/apollo-link-debounce
  const [usernameExistsQuery, { loading: loadingUserNameExist, data }] = useLazyQuery(
    USERNAME_EXIST,
    { fetchPolicy: "no-cache" },
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

  useEffect(() => {
    if (!assertValidInput()) {
      return
    }

    usernameExistsQuery({ variables: { username: input } })
  }, [input])

  useEffect(() => {
    if (!assertValidInputLength()) {
      if (shouldShowErrorMessage) {
        setMessage(translate("UsernameScreen.3CharactersMinimum"))
        setMessageIsError(true)
      }
      inputForm.current.focus()
      return
    }

    if (!assertValidInputCharacters()) {
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
  }, [data, input])

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

  const assertValidInputLength = (): boolean => {
    return input.length >= 3
  }

  const assertValidInputCharacters = (): boolean => {
    return new RegExp(/^[0-9a-z_]+$/i).test(input)
  }

  const assertValidInput = (): boolean => {
    return assertValidInputLength() && assertValidInputCharacters()
  }

  const validate = async () => {
    if (!isFocused) {
      return
    }

    setShouldShowErrorMessage(true)
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

    if (!shouldShowErrorMessage && value.length > 2) {
      setShouldShowErrorMessage(true)
    }
  }

  const inputForm = React.createRef<TextInput>()

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
