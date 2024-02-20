import CustomModal from "@app/components/custom-modal/custom-modal"
import { useI18nContext } from "@app/i18n/i18n-react"
import * as React from "react"
import { Text, makeStyles } from "@rneui/themed"
import { GaloyIcon } from "@app/components/atomic/galoy-icon"

export type DeviceAccountFailModalProps = {
  isVisible: boolean
  closeModal: () => void
  navigateToHomeScreen: () => void
}

export const DeviceAccountFailModal: React.FC<DeviceAccountFailModalProps> = ({
  isVisible,
  closeModal,
  navigateToHomeScreen,
}) => {
  const { LL } = useI18nContext()
  const styles = useStyles()

  return (
    <CustomModal
      isVisible={isVisible}
      toggleModal={closeModal}
      image={<GaloyIcon name="payment-error" size={100} />}
      title={LL.GetStartedScreen.trialAccountCreationFailed()}
      body={
        <Text style={styles.errorBodyText} type="h2">
          {LL.GetStartedScreen.trialAccountCreationFailedMessage()}
        </Text>
      }
      primaryButtonTitle={LL.GetStartedScreen.exploreWallet()}
      primaryButtonOnPress={navigateToHomeScreen}
    />
  )
}

const useStyles = makeStyles(() => ({
  errorBodyText: {
    textAlign: "center",
  },
}))
