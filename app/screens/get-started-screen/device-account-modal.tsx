import { gql } from "@apollo/client"
import CustomModal from "@app/components/custom-modal/custom-modal"
import { useUserLoginDeviceMutation } from "@app/graphql/generated"
import { useAppConfig } from "@app/hooks"
import { useI18nContext } from "@app/i18n/i18n-react"
import { RootStackParamList } from "@app/navigation/stack-param-lists"
import { useNavigation } from "@react-navigation/native"
import { StackNavigationProp } from "@react-navigation/stack"
import * as React from "react"
import { Text, makeStyles, useTheme } from "@rneui/themed"
import { GaloyIcon } from "@app/components/atomic/galoy-icon"
import { View } from "react-native"
import { LocalizedString } from "typesafe-i18n"
import { DeviceAccountFailModal } from "./device-account-fail-modal"
import { useEffect } from "react"
import {
  logAttemptCreateDeviceAccount,
  logCreateDeviceAccountFailure,
  logCreatedDeviceAccount,
} from "@app/utils/analytics"

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
  appCheckToken: string
}

export const DeviceAccountModal: React.FC<DeviceAccountModalProps> = ({
  isVisible,
  closeModal,
  appCheckToken,
}) => {
  const { setAuthenticatedWithDeviceAccount } = useAppConfig()

  const [userDeviceLogin, { loading }] = useUserLoginDeviceMutation()
  const [hasError, setHasError] = React.useState(false)
  const { LL } = useI18nContext()
  const navigation =
    useNavigation<StackNavigationProp<RootStackParamList, "getStarted">>()

  const createDeviceAccountAndLogin = async () => {
    try {
      logAttemptCreateDeviceAccount()
      const { data } = await userDeviceLogin({
        variables: {
          input: {
            jwt: appCheckToken,
          },
        },
      })

      const sessionToken = data?.userLoginDevice.authToken
      if (sessionToken) {
        logCreatedDeviceAccount()
        setAuthenticatedWithDeviceAccount()
        navigation.replace("Primary")
        closeModal()
        return
      }
    } catch (error) {
      logCreateDeviceAccountFailure()
      console.log("Error creating device account: ", error)
    }

    setHasError(true)
  }

  useEffect(() => {
    if (!isVisible) {
      setHasError(false)
    }
  }, [isVisible])

  const navigateToPhoneLogin = () => {
    navigation.navigate("phoneFlow")
    closeModal()
  }

  const navigateToHomeScreen = () => {
    navigation.navigate("Primary")
    closeModal()
  }

  return hasError ? (
    <DeviceAccountFailModal
      isVisible={isVisible}
      closeModal={closeModal}
      navigateToPhoneLogin={navigateToPhoneLogin}
      navigateToHomeScreen={navigateToHomeScreen}
    />
  ) : (
    <CustomModal
      isVisible={isVisible}
      toggleModal={closeModal}
      image={<GaloyIcon name="warning-with-background" size={100} />}
      title={LL.GetStartedScreen.trialAccountHasLimits()}
      body={
        <View>
          <LimitItem text={LL.GetStartedScreen.trialAccountLimits.noBackup()} />
          <LimitItem text={LL.GetStartedScreen.trialAccountLimits.sendingLimit()} />
          <LimitItem text={LL.GetStartedScreen.trialAccountLimits.noOnchain()} />
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
  const styles = useStyles()

  const {
    theme: { colors },
  } = useTheme()
  return (
    <View style={styles.limitRow}>
      <GaloyIcon color={colors.error} name="close" size={14} />
      <Text type="h2" style={styles.limitText}>
        {text}
      </Text>
    </View>
  )
}

const useStyles = makeStyles(() => ({
  limitRow: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 8,
  },
  limitText: {
    marginLeft: 12,
  },
}))
