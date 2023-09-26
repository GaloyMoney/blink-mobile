import { useI18nContext } from "@app/i18n/i18n-react"
import React, { useState } from "react"
import { GaloyTertiaryButton } from "../atomic/galoy-tertiary-button"
import ContactModal, { SupportChannels } from "../contact-modal/contact-modal"
import { StyleProp, ViewStyle } from "react-native"
import { getReadableVersion } from "react-native-device-info"
import { isIos } from "@app/utils/helper"
import { useAppConfig } from "@app/hooks"

export const ContactSupportButton = ({
  containerStyle,
}: {
  containerStyle: StyleProp<ViewStyle>
}) => {
  const [showContactSupport, setShowContactSupport] = useState(false)
  const { LL } = useI18nContext()
  const { appConfig } = useAppConfig()
  const { name: bankName } = appConfig.galoyInstance

  const messageBody = LL.support.defaultSupportMessage({
    os: isIos ? "iOS" : "Android",
    version: getReadableVersion(),
    bankName,
  })

  const messageSubject = LL.support.defaultEmailSubject({
    bankName,
  })

  return (
    <>
      <ContactModal
        messageBody={messageBody}
        messageSubject={messageSubject}
        isVisible={showContactSupport}
        toggleModal={() => setShowContactSupport(!showContactSupport)}
        supportChannels={[
          SupportChannels.Faq,
          SupportChannels.StatusPage,
          SupportChannels.Email,
          SupportChannels.WhatsApp,
        ]}
      />
      <GaloyTertiaryButton
        containerStyle={containerStyle}
        title={LL.support.contactUs()}
        onPress={() => setShowContactSupport(true)}
      />
    </>
  )
}
