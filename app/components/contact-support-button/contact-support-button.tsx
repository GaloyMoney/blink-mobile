import { useI18nContext } from "@app/i18n/i18n-react"
import React, { useState } from "react"
import { GaloyTertiaryButton } from "../atomic/galoy-tertiary-button"
import ContactModal from "../contact-modal/contact-modal"
import { StyleProp, ViewStyle } from "react-native"

export const ContactSupportButton = ({
  containerStyle,
}: {
  containerStyle: StyleProp<ViewStyle>
}) => {
  const [showContactSupport, setShowContactSupport] = useState(false)
  const { LL } = useI18nContext()
  return (
    <>
      <ContactModal
        isVisible={showContactSupport}
        toggleModal={() => setShowContactSupport(!showContactSupport)}
      />
      <GaloyTertiaryButton
        containerStyle={containerStyle}
        title={LL.support.contactUs()}
        onPress={() => setShowContactSupport(true)}
      />
    </>
  )
}
