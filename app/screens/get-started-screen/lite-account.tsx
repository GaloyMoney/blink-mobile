import { useI18nContext } from "@app/i18n/i18n-react"
import { StackNavigationProp } from "@react-navigation/stack"
import * as React from "react"
import { StyleSheet, View } from "react-native"
import { Screen } from "../../components/screen"
import { RootStackParamList } from "../../navigation/stack-param-lists"
import { palette } from "../../theme/palette"

import { useAppConfig } from "@app/hooks"
import analytics from "@react-native-firebase/analytics"
import DeviceInfo from "react-native-device-info"

import {
  useNetworkQuery,
  useUserDeviceAccountCreateMutation,
} from "@app/graphql/generated"
import { useLevel } from "@app/graphql/level-context"
import { testProps } from "@app/utils/testProps"
import { useNavigation } from "@react-navigation/native"
import { Button, Text } from "@rneui/themed"

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

export const SetUpLiteDeviceAccountScreen = () => {
  const { saveToken } = useAppConfig()
  const { data: dataNetwork } = useNetworkQuery()
  const network = dataNetwork?.globals?.network
  const [userDeviceAccountCreate] = useUserDeviceAccountCreateMutation({
    fetchPolicy: "no-cache",
  })

  const navigation =
    useNavigation<StackNavigationProp<RootStackParamList, "getStarted">>()

  const { LL } = useI18nContext()

  const { isLevel0 } = useLevel()

  // TODO this function need to be tests (maybe as an independent hook?)
  React.useEffect(() => {
    ;(async () => {
      // TODO: remove once feature is completed.
      // This is a temporary measure to prevent ddos our backend
      if (!network || network === "mainnet") {
        return
      }

      if (!userDeviceAccountCreate || !saveToken || isLevel0) {
        return
      }

      const uniqueId = await DeviceInfo.getUniqueId()

      const { data } = await userDeviceAccountCreate({
        variables: {
          input: {
            deviceId: uniqueId,
          },
        },
      })

      const token = data?.userDeviceAccountCreate.authToken

      if (token) {
        analytics().logLogin({ method: "device" })
        saveToken(token)
      } else {
        console.error(
          data?.userDeviceAccountCreate.errors,
          "error creating userDeviceAccount",
        )
      }
    })()
  }, [userDeviceAccountCreate, saveToken, isLevel0, network])

  return (
    <Screen style={styles.screen}>
      <View style={styles.bottom}>
        {isLevel0 ? (
          <Text>
            {
              "your lite account is ready.\n\nKeep in mind this lite account doesn't have backup\n\nPlease register to a full account whenever convenient so you don't loose your money if you loose your phone"
            }
          </Text>
        ) : (
          <Text>{"Creating your lite account..."}</Text>
        )}

        <Button
          title={LL.common.ok()}
          titleStyle={styles.buttonTitle}
          onPress={() => navigation.replace("Primary")}
          containerStyle={styles.buttonContainer}
          {...testProps(LL.GetStartedScreen.startLiteAccount())}
        />
      </View>
    </Screen>
  )
}
