import { CONTACT_EMAIL_ADDRESS, WHATSAPP_CONTACT_NUMBER } from "@app/config"
import { palette } from "@app/theme"
import React from "react"
import { Linking, View } from "react-native"
import EStyleSheet from "react-native-extended-stylesheet"
import ReactNativeModal from "react-native-modal"
import { openWhatsApp } from "@app/utils/external"
import { ListItem, Icon } from "@rneui/base"
import { useI18nContext } from "@app/i18n/i18n-react"

const styles = EStyleSheet.create({
  modal: {
    justifyContent: "flex-end",
    margin: 0,
    flexDirection: "row",
  },
  content: {
    backgroundColor: palette.white,
    paddingBottom: "50rem",
  },
})

type ContactModalProps = {
  isVisible: boolean
  toggleModal: () => void
}

/*
A modal component that displays contact options at the bottom of the screen.
*/
const ContactModal: React.FC<ContactModalProps> = ({ isVisible, toggleModal }) => {
  const { LL } = useI18nContext()
  const openWhatsAppAction = () => {
    openWhatsApp(WHATSAPP_CONTACT_NUMBER, LL.support.defaultSupportMessage())
    toggleModal()
  }

  const openEmailAction = () => {
    Linking.openURL(
      `mailto:${CONTACT_EMAIL_ADDRESS}?subject=${LL.support.defaultEmailSubject()}&body=${LL.support.defaultSupportMessage()}`,
    )
    toggleModal()
  }

  const openPhoneAction = () => {
    Linking.openURL(`tel:${WHATSAPP_CONTACT_NUMBER}`)
    toggleModal()
  }

  const contactOptionList = [
    {
      name: LL.support.whatsapp(),
      icon: "ios-logo-whatsapp",
      action: openWhatsAppAction,
    },
    {
      name: LL.support.email(),
      icon: "mail-outline",
      action: openEmailAction,
    },
    {
      name: LL.support.phone(),
      icon: "call-outline",
      action: openPhoneAction,
    },
  ]
  return (
    <ReactNativeModal
      isVisible={isVisible}
      onBackdropPress={toggleModal}
      style={styles.modal}
    >
      <View style={styles.content}>
        {contactOptionList.map((item, i) => {
          return (
            <ListItem key={i} bottomDivider onPress={item.action}>
              <Icon name={item.icon} type="ionicon" />
              <ListItem.Content>
                <ListItem.Title>{item.name}</ListItem.Title>
              </ListItem.Content>
              <ListItem.Chevron />
            </ListItem>
          )
        })}
      </View>
    </ReactNativeModal>
  )
}

export default ContactModal
