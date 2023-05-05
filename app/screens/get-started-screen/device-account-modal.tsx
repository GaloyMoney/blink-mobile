import { gql } from "@apollo/client"
import CustomModal from "@app/components/custom-modal/custom-modal"
import { useUserLoginDeviceMutation } from "@app/graphql/generated"
import { useAppConfig } from "@app/hooks"
import { useI18nContext } from "@app/i18n/i18n-react"
import { RootStackParamList } from "@app/navigation/stack-param-lists"
import { useNavigation } from "@react-navigation/native"
import { StackNavigationProp } from "@react-navigation/stack"
import * as React from "react"
import { Text, useTheme } from "@rneui/themed"
import { GaloyIcon } from "@app/components/atomic/galoy-icon"
import { View, StyleSheet } from "react-native"
import { LocalizedString } from "typesafe-i18n"

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

export type DeviceAccountModalProps = {
  isVisible: boolean
  closeModal: () => void
  deviceToken: string
  onDeviceAccountCreationFailed: () => void
}

export const DeviceAccountModal: React.FC<DeviceAccountModalProps> = ({
  isVisible,
  closeModal,
  deviceToken,
  onDeviceAccountCreationFailed,
}) => {
  const { setAuthenticatedWithDeviceAccount } = useAppConfig()

  const [userDeviceLogin, { loading }] = useUserLoginDeviceMutation()

  const { LL } = useI18nContext()
  const navigation =
    useNavigation<StackNavigationProp<RootStackParamList, "getStarted">>()

  const createDeviceAccountAndLogin = async () => {
    const { data } = await userDeviceLogin({
      variables: {
        input: {
          jwt: deviceToken,
        },
      },
    })

    const sessionToken = data?.userLoginDevice.authToken
    if (sessionToken) {
      setAuthenticatedWithDeviceAccount()
      navigation.replace("Primary")
      return
    }

    onDeviceAccountCreationFailed()
  }

  const navigateToPhoneLogin = () => {
    navigation.navigate("phoneFlow")
  }

  return (
    <CustomModal
      isVisible={isVisible}
      toggleModal={closeModal}
      image={<GaloyIcon name="warning-with-background" size={100} />}
      title={LL.GetStartedScreen.liteAccountHasLimits()}
      body={
        <View>
          <LimitItem text={LL.GetStartedScreen.liteAccountLimits.noBackup()} />
          <LimitItem text={LL.GetStartedScreen.liteAccountLimits.sendingLimit()} />
          <LimitItem text={LL.GetStartedScreen.liteAccountLimits.noOnchain()} />
        </View>
      }
      primaryButtonTitle={LL.GetStartedScreen.iUnderstand()}
      primaryButtonOnPress={createDeviceAccountAndLogin}
      primaryButtonLoading={loading}
      primaryButtonDisabled={loading}
      secondaryButtonTitle={LL.GetStartedScreen.registerPhoneAccount()}
      secondaryButtonOnPress={navigateToPhoneLogin}
    />
  )
}

const LimitItem = ({ text }: { text: LocalizedString }) => {
  const { theme } = useTheme()
  return (
    <View style={styles.limitRow}>
      <GaloyIcon color={theme.colors.error} name="close" size={14} />
      <Text type="h2" style={styles.limitText}>
        {text}
      </Text>
    </View>
  )
}

const styles = StyleSheet.create({
  limitRow: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 8,
  },
  limitText: {
    marginLeft: 12,
  },
})
