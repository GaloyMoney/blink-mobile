import * as React from "react"
import debounce from "lodash.debounce"
import { gql, useQuery, useMutation } from "@apollo/client"
import { StackNavigationProp } from "@react-navigation/stack"
import { ActivityIndicator, Alert, Text, TextInput } from "react-native"
import { Input } from "react-native-elements"
import EStyleSheet from "react-native-extended-stylesheet"

import { Screen } from "../../components/screen"
import { translateUnknown as translate } from "@galoymoney/client"
import { color, palette } from "../../theme"
import * as UsernameValidation from "../../utils/validation"
import { InvalidUsernameError } from "../../utils/validation"
import type { ScreenType } from "../../types/jsx"
import type { RootStackParamList } from "../../navigation/stack-param-lists"
import { USERNAME_AVAILABLE } from "../../graphql/query"
import useMainQuery from "@app/hooks/use-main-query"

const styles = EStyleSheet.create({
  activity: { marginTop: 12 },

  /* eslint-disable react-native/no-unused-styles */
  availableMessage: { color: palette.green },
  errorMessage: { color: palette.red },

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

const UPDATE_USERNAME = gql`
  mutation updateUsername($username: Username!) {
    userUpdateUsername(input: { username: $username }) {
      errors {
        message
      }
      user {
        id
        username
      }
    }
  }
`

export const UsernameScreen: ScreenType = ({ navigation }: Props) => {
  const [input, setInput] = React.useState("")
  const [inputStatus, setInputStatus] = React.useState({
    status: "empty",
    message: "",
  })

  const { loading: checkingUserName, refetch: checkUsername } = useQuery(
    USERNAME_AVAILABLE,
    { skip: true }, // useLazyQuery executor function does not return data. refetch does.
  )
  const { refetch: refetchMain } = useMainQuery()
  const inputForm = React.createRef<TextInput>()

  const [updateUsername, { loading: updatingUsername }] = useMutation(UPDATE_USERNAME, {
    onError: (error) => {
      console.error(error)
      setInputStatus({ message: translate("errors.generic"), status: "error" })
    },
    onCompleted: (data) => {
      const { errors, user } = data.userUpdateUsername

      const errorMessage =
        errors.length > 0 || !user
          ? errors[0]?.message || "issue setting up username"
          : null

      if (errorMessage) {
        setInputStatus({ message: errorMessage, status: "error" })
      }

      refetchMain()

      Alert.alert(translate("UsernameScreen.success", { input }), null, [
        {
          text: translate("common.ok"),
          onPress: () => {
            navigation.pop(2)
          },
        },
      ])
    },
  })

  const checkUsernameDebounced = React.useMemo(
    () =>
      debounce(async () => {
        const { data } = await checkUsername({ username: input })
        const usernameAvailable = data?.usernameAvailable

        if (usernameAvailable === true) {
          setInputStatus({
            message: translate("UsernameScreen.available", { input }),
            status: "available",
          })
        }
        if (usernameAvailable === false) {
          setInputStatus({
            message: translate("UsernameScreen.notAvailable", { input }),
            status: "error",
          })
        }
      }, 1000),
    [checkUsername, input],
  )

  React.useEffect(() => {
    checkUsernameDebounced()
    return () => checkUsernameDebounced.cancel()
  }, [checkUsernameDebounced])

  const validateAndConfirm = async () => {
    if (inputStatus.status !== "available") {
      inputForm.current.focus()
      return
    }

    if (!UsernameValidation.hasValidLength(input)) {
      setInputStatus({
        message: translate("UsernameScreen.3CharactersMinimum"),
        status: "error",
      })
      inputForm.current.focus()
      return
    }

    Alert.alert(
      translate("UsernameScreen.confirmTitle", { input }),
      translate("UsernameScreen.confirmSubtext"),
      [
        {
          text: translate("common.cancel"),
          onPress: () => console.debug("Cancel Pressed"),
          style: "cancel",
        },
        {
          text: translate("common.ok"),
          onPress: () =>
            updateUsername({
              variables: { username: input },
            }),
        },
      ],
    )
  }

  const onChangeText = (value) => {
    setInputStatus({ message: "", status: "" })
    setInput(value)
    if (value) {
      const checkedUsername = UsernameValidation.validateUsername(value)
      if (checkedUsername instanceof InvalidUsernameError) {
        setInputStatus({ message: String(checkedUsername.message), status: "error" })
      }
    }
  }

  return (
    <Screen preset="scroll" style={styles.screenStyle}>
      <Text style={styles.text}>{translate("UsernameScreen.usernameToUse")}</Text>
      <Input
        ref={inputForm}
        autoFocus
        placeholder={translate("common.username")}
        leftIcon={{ type: "ionicon", name: "ios-person-circle" }}
        onChangeText={onChangeText}
        errorStyle={styles[`${inputStatus.status}Message`]}
        errorMessage={checkingUserName ? "" : inputStatus.message}
        maxLength={20}
        returnKeyType="send"
        textContentType="username"
        onBlur={validateAndConfirm}
        autoCompleteType="username"
        autoCapitalize="none"
      />
      <ActivityIndicator
        animating={updatingUsername}
        size="large"
        color={color.primary}
        style={styles.activity}
      />
    </Screen>
  )
}
