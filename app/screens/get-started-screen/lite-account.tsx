import { useI18nContext } from "@app/i18n/i18n-react"
import { StackNavigationProp } from "@react-navigation/stack"
import * as React from "react"
import { StyleSheet, View } from "react-native"
import { Screen } from "../../components/screen"
import { RootStackParamList } from "../../navigation/stack-param-lists"
import { palette } from "../../theme/palette"
import { useAppConfig } from "@app/hooks"

import { testProps } from "@app/utils/testProps"
import { RouteProp, useNavigation } from "@react-navigation/native"
import { Button, Text } from "@rneui/themed"
import { gql } from "@apollo/client"
import { useUserLoginDeviceMutation } from "@app/graphql/generated"

const styles = StyleSheet.create({
  bottom: {
    alignItems: "center",
    flex: 1,
    justifyContent: "flex-end",
    marginBottom: 36,
    width: "100%",
  },

  buttonContainer: {
    marginVertical: 12,
    width: "80%",
    backgroundColor: palette.lightBlue,
    borderRadius: 24,
  },

  buttonTitle: {
    color: palette.white,
    fontWeight: "bold",
  },

  screen: {
    alignItems: "center",
    flex: 1,
    width: "100%",
  },
})

gql`
  mutation userLoginDevice($input: UserLoginDeviceInput!) {
    userLoginDevice(input: $input) {
      authToken
      errors {
        message
      }
    }
  }
`
type Props = { route: RouteProp<RootStackParamList, "liteDeviceAccount"> }
export const SetUpLiteDeviceAccountScreen: React.FC<Props> = ({
  route: {
    params: { deviceToken },
  },
}) => {
  const { saveToken } = useAppConfig()

  const [ userDeviceLogin, { loading } ] = useUserLoginDeviceMutation()

  const navigation =
    useNavigation<StackNavigationProp<RootStackParamList, "getStarted">>()

  const { LL } = useI18nContext()

  const createAccountAndSaveToken = async () => {
    const { data } = await userDeviceLogin({
      variables: {
        input: {
          jwt: deviceToken,
        },
      },
    })

    const sessionToken = data?.userLoginDevice.authToken
    if (sessionToken) {
      saveToken(sessionToken)
      navigation.replace("Primary")
      return
    }

    console.log("Something went wrong", data?.userLoginDevice.errors)
    
  }

  return (
    <Screen style={styles.screen}>
      <Text>Device Token: {deviceToken}</Text>
      <View style={styles.bottom}>
        <Text>
          Keep in mind this lite account doesn't have backup\n\nPlease register to a full
          account whenever convenient so you don't loose your money if you loose your
          phone
        </Text>
        <Button
          title={"I agree, create account"}
          titleStyle={styles.buttonTitle}
          onPress={createAccountAndSaveToken}
          loading={loading}
          containerStyle={styles.buttonContainer}
          {...testProps(LL.GetStartedScreen.startLiteAccount())}
        />
      </View>
    </Screen>
  )
}
