import { gql } from "@apollo/client"
import { GaloyErrorBox } from "@app/components/atomic/galoy-error-box"
import { Screen } from "@app/components/screen"
import { useUserTotpRegistrationValidateMutation } from "@app/graphql/generated"
import { useAppConfig } from "@app/hooks"
import { useI18nContext } from "@app/i18n/i18n-react"
import { RootStackParamList } from "@app/navigation/stack-param-lists"
import { testProps } from "@app/utils/testProps"
import { RouteProp, useNavigation } from "@react-navigation/native"
import { StackNavigationProp } from "@react-navigation/stack"
import { Input, Text, makeStyles, useTheme } from "@rneui/themed"
import React, { useCallback, useState } from "react"
import { ActivityIndicator, Alert, View } from "react-native"

const useStyles = makeStyles(({ colors }) => ({
  screenStyle: {
    padding: 20,
    flexGrow: 1,
  },
  viewWrapper: { flex: 1 },

  activityIndicator: { marginTop: 12 },
  textContainer: {
    marginBottom: 20,
  },

  inputComponentContainerStyle: {
    flexDirection: "row",
    marginBottom: 20,
    paddingLeft: 0,
    paddingRight: 0,
    justifyContent: "center",
  },
  inputContainerStyle: {
    minWidth: 160,
    minHeight: 60,
    borderWidth: 2,
    borderBottomWidth: 2,
    paddingHorizontal: 10,
    borderColor: colors.primary5,
    borderRadius: 8,
    marginRight: 0,
  },
  inputStyle: {
    fontSize: 24,
    textAlign: "center",
  },
  errorContainer: {
    marginBottom: 20,
  },
}))

gql`
  mutation userTotpRegistrationValidate($input: UserTotpRegistrationValidateInput!) {
    userTotpRegistrationValidate(input: $input) {
      errors {
        message
      }
      me {
        totpEnabled
        phone
        email {
          address
          verified
        }
      }
    }
  }
`

type Props = {
  route: RouteProp<RootStackParamList, "totpRegistrationValidate">
}

const placeholder = "000000"

export const TotpRegistrationValidateScreen: React.FC<Props> = ({ route }) => {
  const navigation =
    useNavigation<StackNavigationProp<RootStackParamList, "totpRegistrationValidate">>()

  const {
    theme: { colors },
  } = useTheme()

  const styles = useStyles()

  const [totpRegistrationValidate] = useUserTotpRegistrationValidateMutation()

  const [errorMessage, setErrorMessage] = useState<string>("")

  const [code, _setCode] = useState("")
  const [loading, setLoading] = useState(false)
  const totpRegistrationId = route.params.totpRegistrationId

  const { appConfig } = useAppConfig()
  const authToken = appConfig.token

  const { LL } = useI18nContext()

  const send = useCallback(
    async (code: string) => {
      try {
        setLoading(true)

        const res = await totpRegistrationValidate({
          variables: { input: { totpCode: code, totpRegistrationId, authToken } },
        })

        if (res.data?.userTotpRegistrationValidate.errors) {
          const error = res.data.userTotpRegistrationValidate.errors[0]?.message
          // TODO: manage translation for errors
          setErrorMessage(error)
        }

        if (res.data?.userTotpRegistrationValidate.me?.totpEnabled) {
          Alert.alert(LL.common.success(), LL.TotpRegistrationValidateScreen.success(), [
            {
              text: LL.common.ok(),
              onPress: () => {
                navigation.navigate("accountScreen")
              },
            },
          ])
        }
      } catch (err) {
        console.error(err)
      } finally {
        setLoading(false)
      }
    },
    [navigation, LL, totpRegistrationId, authToken, totpRegistrationValidate],
  )

  const setCode = (code: string) => {
    if (code.length > 6) {
      return
    }

    setErrorMessage("")
    _setCode(code)
    if (code.length === 6) {
      send(code)
    }
  }

  return (
    <Screen
      preset="scroll"
      style={styles.screenStyle}
      keyboardOffset="navigationHeader"
      keyboardShouldPersistTaps="handled"
    >
      <View style={styles.viewWrapper}>
        <View style={styles.textContainer}>
          <Text type="h2">{LL.TotpRegistrationValidateScreen.title()}</Text>
        </View>

        <Input
          {...testProps(placeholder)}
          placeholder={placeholder}
          containerStyle={styles.inputComponentContainerStyle}
          inputContainerStyle={styles.inputContainerStyle}
          inputStyle={styles.inputStyle}
          value={code}
          onChangeText={setCode}
          renderErrorMessage={false}
          autoFocus={true}
          textContentType={"oneTimeCode"}
          keyboardType="numeric"
        />
        {errorMessage && (
          <View style={styles.errorContainer}>
            <GaloyErrorBox errorMessage={errorMessage} />
          </View>
        )}
        {loading && (
          <ActivityIndicator
            style={styles.activityIndicator}
            size="large"
            color={colors.primary}
          />
        )}
      </View>
    </Screen>
  )
}
