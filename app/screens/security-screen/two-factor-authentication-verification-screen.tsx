import * as React from "react"
import { useEffect, useState } from "react"
import { ActivityIndicator, SafeAreaView, Text, View } from "react-native"
import { Input } from "react-native-elements"
import { gql, useLazyQuery, useMutation } from "@apollo/client"
import { RouteProp } from "@react-navigation/native"
import { StackNavigationProp } from "@react-navigation/stack"
import EStyleSheet from "react-native-extended-stylesheet"

import { Screen } from "../../components/screen"
import { RootStackParamList } from "@app/navigation/stack-param-lists"
import { translate } from "../../i18n/translate"
import { color } from "../../theme/color"
import { toastShow } from "../../utils/toast"
import { TwoFAVerificationType } from "."
import { GET_TWO_FA_ENABLED } from "../../graphql/query"

const SAVE_2FA = gql`
  mutation save2FA($secret: String!, $token: String!) {
    save2fa(secret: $secret, token: $token)
  }
`

const DELETE_2FA = gql`
  mutation delete2FA($token: String!) {
    delete2fa(token: $token)
  }
`

// const DELETE_2FA = gql`
//   mutation twoFADelete($input: TwoFADeleteInput!) {
//     twoFADelete(input: $input) {
//       errors {
//         message
//       }
//       success
//     }
//   }
// `

type Props = {
  navigation: StackNavigationProp<RootStackParamList, "twoFAVerification">
  route: RouteProp<RootStackParamList, "twoFAVerification">
}

export const TwoFactorAuthenticationVerificationScreen = ({
  route,
  navigation,
}: Props): JSX.Element => {
  const { twoFASecret, verificationType } = route.params

  const [code, setCode] = useState<string>("")

  const [save2FA, { loading: loadingSave2FA }] = useMutation(SAVE_2FA, {
    fetchPolicy: "no-cache",
  })

  const [delete2FA, { loading: loadingDelete2FA }] = useMutation(DELETE_2FA, {
    fetchPolicy: "no-cache",
  })

  const [fetchTwoFAEnabled] = useLazyQuery(GET_TWO_FA_ENABLED, {
    fetchPolicy: "network-only",
  })

  const send = async () => {
    if (loadingSave2FA || loadingDelete2FA) {
      return
    }

    if (code.length !== 6) {
      toastShow(translate("TwoFAVerificationScreen.need6Digits"))
      return
    }

    try {
      if (verificationType === TwoFAVerificationType.Delete) {
        const { data } = await delete2FA({
          variables: { token: code },
        })

        const success = data?.delete2fa
        if (success) {
          fetchTwoFAEnabled()
          navigation.navigate("security")
        } else {
          toastShow(translate("TwoFAVerificationScreen.errorVerifyingCode"))
        }
      } else {
        const { data } = await save2FA({
          variables: { secret: twoFASecret, token: code },
        })

        const success = data?.save2fa
        if (success) {
          fetchTwoFAEnabled()
          navigation.navigate("security")
        } else {
          toastShow(translate("TwoFAVerificationScreen.errorVerifyingCode"))
        }
      }
    } catch (err) {
      console.warn({ err })
      toastShow(`${err}`)
    }
  }

  // useEffect(() => {
  //   ;(async () => {
  //     if (setupMethod === "Linking") {
  //       Linking.openURL(twoFAUri)
  //     }
  //   })()
  // }, [setupMethod, twoFAUri])

  useEffect(() => {
    if (code.length === 6) {
      send()
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [code])

  const title =
    verificationType === TwoFAVerificationType.Delete
      ? translate("TwoFAVerificationScreen.titleDelete")
      : translate("TwoFAVerificationScreen.title")

  return (
    <Screen preset="fixed">
      <SafeAreaView style={styles.container}>
        <View style={styles.titleTextContainer}>
          <Text style={styles.titleText}>{title}</Text>
          <Text style={styles.subtitleText}>
            {translate("TwoFAVerificationScreen.subtitle")}
          </Text>
        </View>
        <View style={styles.codeContainer}>
          <Input
            autoFocus={true}
            style={styles.code}
            containerStyle={styles.codeInputContainer}
            onChangeText={setCode}
            keyboardType="number-pad"
            textContentType="oneTimeCode"
            placeholder={translate("WelcomePhoneValidationScreen.placeholder")}
            returnKeyType={"done"}
            maxLength={6}
            onSubmitEditing={send}
          >
            {code}
          </Input>
          <ActivityIndicator
            animating={loadingSave2FA || loadingDelete2FA}
            size="small"
            color={color.primary}
            style={styles.activityIndicator}
          />
        </View>
        <View style={styles.bottomContainer}></View>
      </SafeAreaView>
    </Screen>
  )
}

const styles = EStyleSheet.create({
  activityIndicator: {
    marginTop: "8rem",
  },

  bottomContainer: {
    flex: 2,
    justifyContent: "flex-end",
  },

  code: {
    borderColor: color.palette.darkGrey,
    borderRadius: 5,
    borderWidth: 1,
    flex: 1,
    marginHorizontal: "50rem",
    marginVertical: "18rem",
    paddingHorizontal: "18rem",
    paddingVertical: "12rem",
  },

  codeContainer: {
    flex: 1,
    justifyContent: "center",
  },

  codeInputContainer: {
    alignSelf: "center",
    width: "70%",
  },

  container: {
    backgroundColor: color.palette.lighterGrey,
    minHeight: "100%",
  },

  subtitleText: {
    color: color.palette.darkGrey,
    fontSize: "14rem",
    marginHorizontal: "32rem",
    marginTop: "8rem",
    textAlign: "center",
  },

  titleText: {
    color: color.palette.darkGrey,
    fontSize: "20rem",
    fontWeight: "bold",
  },

  titleTextContainer: {
    alignItems: "center",
    flex: 1,
    marginHorizontal: "16rem",
    marginTop: "16rem",
  },
})
