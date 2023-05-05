import CustomModal from "@app/components/custom-modal/custom-modal"
import { useI18nContext } from "@app/i18n/i18n-react"
import { RootStackParamList } from "@app/navigation/stack-param-lists"
import { useNavigation } from "@react-navigation/native"
import { StackNavigationProp } from "@react-navigation/stack"
import * as React from "react"
import { Text } from "@rneui/themed"
import { GaloyIcon } from "@app/components/atomic/galoy-icon"

export type DeviceAccountFailModalProps = {
  isVisible: boolean
  closeModal: () => void
}

export const DeviceAccountFailModal: React.FC<DeviceAccountFailModalProps> = ({
  isVisible,
  closeModal,
}) => {
  const { LL } = useI18nContext()
  const navigation =
    useNavigation<StackNavigationProp<RootStackParamList, "getStarted">>()

  const navigateToPhoneLogin = () => {
    navigation.navigate("phoneFlow")
  }

  const navigateToHomeScreen = () => {
    navigation.navigate("Primary")
  }

  return (
    <CustomModal
      isVisible={isVisible}
      toggleModal={closeModal}
      image={<GaloyIcon name="warning-with-background" size={100} />}
      title={LL.GetStartedScreen.liteAccountCreationFailed()}
      body={
        <Text type="h2">
          {LL.GetStartedScreen.liteAccountCreationFailedMessage()}
        </Text>
      }
      primaryButtonTitle={LL.GetStartedScreen.registerPhoneAccount()}
      primaryButtonOnPress={navigateToPhoneLogin}
      secondaryButtonTitle={LL.GetStartedScreen.exploreWalletInstead()}
      secondaryButtonOnPress={navigateToHomeScreen}
    />
  )
}
