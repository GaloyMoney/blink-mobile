import { CONTACT_EMAIL_ADDRESS, WHATSAPP_CONTACT_NUMBER } from "@app/constants/support"
import { palette } from "@app/theme"
import React from "react"
import { Linking, View } from "react-native"
import EStyleSheet from "react-native-extended-stylesheet"
import ReactNativeModal from "react-native-modal"
import { openWhatsApp } from "@app/utils/external"
import { ListItem, Icon } from "react-native-elements"
import { translate } from "@app/utils/translate"

const styles = EStyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  modal: {
    justifyContent: "flex-end",
    margin: 0,
    flexDirecton: "row",
  },
  content: {
    backgroundColor: palette.white,
    paddingBottom: "50rem",
  },
})

/*
A modal component that displays contact options at the bottom of the screen.
*/
const ContactModal = ({ isVisble, toggleModal }) => {
  const openWhatsAppAction = () => {
    openWhatsApp(WHATSAPP_CONTACT_NUMBER, translate("support.defaultSupportMessage"))
    toggleModal()
  }

  const openEmailAction = () => {
    Linking.openURL(
      `mailto:${CONTACT_EMAIL_ADDRESS}?subject=${translate(
        "support.defaultEmailSubject",
      )}&body=${translate("support.defaultSupportMessage")}`,
    )
    toggleModal()
  }

  const openPhoneAction = () => {
    Linking.openURL(`tel:${WHATSAPP_CONTACT_NUMBER}`)
    toggleModal()
  }

  const contactOptionList = [
    {
      name: translate("support.whatsapp"),
      icon: "ios-logo-whatsapp",
      action: openWhatsAppAction,
    },
    {
      name: translate("support.email"),
      icon: "mail-outline",
      action: openEmailAction,
    },
    {
      name: translate("support.phone"),
      icon: "call-outline",
      action: openPhoneAction,
    },
  ]
  return (
    <View style={styles.container}>
      <ReactNativeModal
        isVisible={isVisble}
        onBackdropPress={() => toggleModal()}
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
    </View>
  )
}

export default ContactModal
