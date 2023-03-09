import { useI18nContext } from "@app/i18n/i18n-react"
import React, { useState } from "react"
import { View, StyleSheet } from "react-native"
import { GaloyTertiaryButton } from "../atomic/galoy-tertiary-button"
import ContactModal from "../contact-modal/contact-modal"

const styles = StyleSheet.create({
  contactSupportButtonContainer: {
    display: "flex",
    flexDirection: "row",
  },
})

export const ContactSupportButton = () => {
  const [showContactSupport, setShowContactSupport] = useState(false)
  const { LL } = useI18nContext()
  return (
    <View style={styles.contactSupportButtonContainer}>
      <ContactModal
        isVisible={showContactSupport}
        toggleModal={() => setShowContactSupport(!showContactSupport)}
      />
      <GaloyTertiaryButton
        outline
        title={LL.support.contactUs()}
        onPress={() => setShowContactSupport(true)}
      />
    </View>
  )
}
