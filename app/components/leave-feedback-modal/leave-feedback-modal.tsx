import { CONTACT_EMAIL_ADDRESS, WHATSAPP_CONTACT_NUMBER } from "@app/config"
import { palette } from "@app/theme"
import React from "react"
import { Linking, View } from "react-native"
import EStyleSheet from "react-native-extended-stylesheet"
import ReactNativeModal from "react-native-modal"
import { openWhatsApp } from "@app/utils/external"
import { ListItem, Icon } from "@rneui/base"
import { useI18nContext } from "@app/i18n/i18n-react"
import { isIos } from "../../utils/helper"
import Clipboard from "@react-native-clipboard/clipboard"
import { toastShow } from "@app/utils/toast"
import { getReadableVersion } from "react-native-device-info"
import { useAppConfig } from "@app/hooks"

const styles = EStyleSheet.create({
  modal: {
    justifyContent: "flex-end",
    margin: 0,
    flexGrow: 1,
  },
  content: {
    backgroundColor: palette.white,
    paddingBottom: "50rem",
  },
})

type LeaveFeedbackModalProps = {
  isVisible: boolean
  toggleModal: () => void
}

/*
A modal component that displays rate, star and improvement suggestions at the bottom of the screen.
*/
const LeaveFeedbackModal: React.FC<LeaveFeedbackModalProps> = ({ isVisible, toggleModal }) => {
  const { LL } = useI18nContext()

  const { appConfig } = useAppConfig()
  const { name: bankName } = appConfig.galoyInstance

  const message = LL.support.defaultSupportMessage({
    os: isIos ? "iOS" : "Android",
    version: getReadableVersion(),
    bankName,
  })

  const openWhatsAppAction = () => {
    openWhatsApp(WHATSAPP_CONTACT_NUMBER, message)
    toggleModal()
  }

  const openEmailAction = () => {
    if (isIos) {
      Clipboard.setString(CONTACT_EMAIL_ADDRESS)
      toastShow({
        message: LL.support.emailCopied({ email: CONTACT_EMAIL_ADDRESS }),
        type: "success",
      })
    } else {
      Linking.openURL(
        `mailto:${CONTACT_EMAIL_ADDRESS}?subject=${LL.support.defaultEmailSubject({
          bankName,
        })}&body=${message}`,
      )
    }
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

export default LeaveFeedbackModal
