import { useState } from "react"

import { SettingsRow } from "../row"
import ContactModal, {
  SupportChannels,
} from "@app/components/contact-modal/contact-modal"

import { useI18nContext } from "@app/i18n/i18n-react"
import { useAppConfig } from "@app/hooks"

import { isIos } from "@app/utils/helper"
import { getReadableVersion } from "react-native-device-info"

export const NeedHelpSetting: React.FC = () => {
  const { LL } = useI18nContext()

  const { appConfig } = useAppConfig()
  const bankName = appConfig.galoyInstance.name

  const [isModalVisible, setIsModalVisible] = useState(false)
  const toggleModal = () => setIsModalVisible((x) => !x)

  const contactMessageBody = LL.support.defaultSupportMessage({
    os: isIos ? "iOS" : "Android",
    version: getReadableVersion(),
    bankName,
  })

  const contactMessageSubject = LL.support.defaultEmailSubject({
    bankName,
  })

  return (
    <>
      <SettingsRow
        title={LL.support.contactUs()}
        leftIcon="help-circle-outline"
        rightIcon={null}
        action={toggleModal}
      />
      <ContactModal
        isVisible={isModalVisible}
        toggleModal={toggleModal}
        messageBody={contactMessageBody}
        messageSubject={contactMessageSubject}
        supportChannels={[
          SupportChannels.Faq,
          SupportChannels.StatusPage,
          SupportChannels.Email,
          SupportChannels.WhatsApp,
        ]}
      />
    </>
  )
}
