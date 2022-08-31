import * as React from "react"
import debounce from "lodash.debounce"
import { useQuery } from "@apollo/client"
import { StackNavigationProp } from "@react-navigation/stack"
import { ActivityIndicator, Alert, Text, TextInput } from "react-native"
import { Input } from "react-native-elements"
import EStyleSheet from "react-native-extended-stylesheet"

import { Screen } from "../../components/screen"
import { useMutation } from "@galoymoney/client"
import { color, palette } from "../../theme"
import * as UsernameValidation from "../../utils/validation"
import { InvalidUsernameError } from "../../utils/validation"
import type { ScreenType } from "../../types/jsx"
import type { RootStackParamList } from "../../navigation/stack-param-lists"
import { USERNAME_AVAILABLE } from "../../graphql/query"
import useMainQuery from "@app/hooks/use-main-query"
import { useI18nContext } from "@app/i18n/i18n-react"

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
  const { LL } = useI18nContext()

  const [updateUsername, { loading: updatingUsername }] = useMutation.userUpdateUsername({
    onError: (error) => {
      console.error(error)
      setInputStatus({ message: LL.errors.generic(), status: "error" })
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

      Alert.alert(LL.UsernameScreen.success({ username: input }), null, [
        {
          text: LL.common.ok(),
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
            message: LL.UsernameScreen.available({ username: input }),
            status: "available",
          })
        }
        if (usernameAvailable === false) {
          setInputStatus({
            message: LL.UsernameScreen.notAvailable({ username: input }),
            status: "error",
          })
        }
      }, 1000),
    [checkUsername, input, LL],
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
        message: LL.UsernameScreen["3CharactersMinimum"](),
        status: "error",
      })
      inputForm.current.focus()
      return
    }

    Alert.alert(
      LL.UsernameScreen.confirmTitle({ username: input }),
      LL.UsernameScreen.confirmSubtext(),
      [
        {
          text: LL.common.cancel(),
          onPress: () => console.debug("Cancel Pressed"),
          style: "cancel",
        },
        {
          text: LL.common.ok(),
          onPress: () =>
            updateUsername({
              variables: { input: { username: input } },
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
      <Text style={styles.text}>{LL.UsernameScreen.usernameToUse()}</Text>
      <Input
        ref={inputForm}
        autoFocus
        placeholder={LL.common.username()}
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
