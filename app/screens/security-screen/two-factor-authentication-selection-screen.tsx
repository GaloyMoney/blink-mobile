import * as React from "react"
import { useCallback, useEffect, useState } from "react"
import { gql, useMutation } from "@apollo/client"
import { Linking, Text, View } from "react-native"
import { ListItem } from "react-native-elements"
import EStyleSheet from "react-native-extended-stylesheet"
import { StackNavigationProp } from "@react-navigation/stack"

import { Screen } from "../../components/screen"
import { color } from "../../theme"
import { translate } from "../../i18n/translate"
import { RootStackParamList } from "../../navigation/stack-param-lists"
import { toastShow } from "../../utils/toast"
import { TwoFAVerificationType } from "."

const GENERATE_2FA = gql`
  mutation generate2FA {
    generate2fa {
      secret
      uri
    }
  }
`

// const GENERATE_2FA = gql`
//   mutation twoFAGenerate {
//     twoFAGenerate {
//       errors {
//         message
//       }
//       twoFASecret {
//         secret
//         uri
//       }
//     }
//   }
// `

type Props = {
  navigation: StackNavigationProp<RootStackParamList, "twoFASelection">
}

export const TwoFactorAuthenticationSelectionScreen = ({
  navigation,
}: Props): JSX.Element => {
  const [twoFASecret, setTwoFASecret] = useState<string | null>()
  const [twoFAUri, setTwoFAUri] = useState<string | null>()

  const [generate2FA, { loading: loadingGenerate2FA }] = useMutation(GENERATE_2FA, {
    fetchPolicy: "no-cache",
  })

  const request2FA = useCallback(async () => {
    const { data } = await generate2FA()
    setTwoFASecret(data?.generate2fa?.secret)
    setTwoFAUri(data?.generate2fa?.uri)
  }, [generate2FA])

  useEffect(() => {
    request2FA()
  }, [request2FA])

  const select2FASetupMethod = (verificationType: TwoFAVerificationType) => {
    if (twoFASecret === null || setTwoFAUri === null) {
      if (loadingGenerate2FA) {
        toastShow(translate("TwoFASelectionScreen.loading"))
        return
      }
      request2FA()
      toastShow(translate("TwoFASelectionScreen.errorGenerating"))
      return
    }

    if (verificationType === TwoFAVerificationType.Linking) {
      Linking.openURL(twoFAUri)
      navigation.navigate("twoFAVerification", {
        twoFASecret,
        twoFAUri,
        verificationType,
      })
      return
    }

    navigation.navigate("twoFASecret", {
      twoFASecret,
      twoFAUri,
      verificationType,
    })
  }

  return (
    <Screen style={styles.container} preset="fixed">
      <View style={styles.titleTextContainer}>
        <Text style={styles.titleText}>{translate("TwoFASelectionScreen.title")}</Text>
        <Text style={styles.subtitleText}>
          {translate("TwoFASelectionScreen.subtitle")}
        </Text>
      </View>
      <View style={styles.setupOptionsContainer}>
        <ListItem
          key={`setup-option-linking`}
          onPress={() => select2FASetupMethod(TwoFAVerificationType.Linking)}
        >
          <ListItem.Content>
            <View>
              <ListItem.Title style={{}}>
                <Text>{translate("TwoFASelectionScreen.linkingLabel")}</Text>
              </ListItem.Title>
            </View>
          </ListItem.Content>
        </ListItem>
        <ListItem
          key={`setup-option-copy-secret`}
          onPress={() => select2FASetupMethod(TwoFAVerificationType.CopySecret)}
        >
          <ListItem.Content>
            <View>
              <ListItem.Title style={{}}>
                <Text>{translate("TwoFASelectionScreen.copySecretLabel")}</Text>
              </ListItem.Title>
            </View>
          </ListItem.Content>
        </ListItem>
        <ListItem
          key={`setup-option-qr`}
          onPress={() => select2FASetupMethod(TwoFAVerificationType.QR)}
        >
          <ListItem.Content>
            <View>
              <ListItem.Title style={{}}>
                <Text>{translate("TwoFASelectionScreen.qrLabel")}</Text>
              </ListItem.Title>
            </View>
          </ListItem.Content>
        </ListItem>
      </View>
    </Screen>
  )
}

const styles = EStyleSheet.create({
  container: {
    backgroundColor: color.palette.lighterGrey,
    minHeight: "100%",
  },

  setupOptionsContainer: {
    flex: 1,
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
    marginBottom: "16rem",
    marginHorizontal: "16rem",
    marginTop: "16rem",
  },
})
