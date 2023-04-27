import React from "react"
import { Linking, View } from "react-native"
import ReactNativeModal from "react-native-modal"

import { CONTACT_EMAIL_ADDRESS, WHATSAPP_CONTACT_NUMBER } from "@app/config"
import { useI18nContext } from "@app/i18n/i18n-react"
import { palette } from "@app/theme"
import { openWhatsApp } from "@app/utils/external"
import { toastShow } from "@app/utils/toast"
import Clipboard from "@react-native-clipboard/clipboard"
import { Icon, ListItem } from "@rneui/base"
import { makeStyles } from "@rneui/themed"

import { isIos } from "../../utils/helper"
import TelegramOutline from "./telegram.svg"

const useStyles = makeStyles((theme) => ({
  modal: {
    justifyContent: "flex-end",
    margin: 0,
    flexGrow: 1,
  },
  content: {
    backgroundColor: theme.colors.whiteOrDarkGrey,
    paddingBottom: 50,
  },
  listItemContainer: {
    backgroundColor: theme.colors.whiteOrDarkGrey,
  },
  listItemTitle: {
    color: theme.colors.darkGreyOrWhite,
  },
  icons: {
    backgroundColor: palette.white,
    borderRadius: 12,
    padding: 2,
  },
}))

type Props = {
  isVisible: boolean
  toggleModal: () => void
  messageBody: string
  messageSubject: string
  showStatusPage?: boolean
}

/*
A modal component that displays contact options at the bottom of the screen.
*/
const ContactModal: React.FC<Props> = ({
  isVisible,
  toggleModal,
  messageBody,
  messageSubject,
  showStatusPage,
}) => {
  const { LL } = useI18nContext()
  const styles = useStyles()

  const openEmailAction = () => {
    if (isIos) {
      Clipboard.setString(CONTACT_EMAIL_ADDRESS)
      toastShow({
        message: LL.support.emailCopied({ email: CONTACT_EMAIL_ADDRESS }),
        type: "success",
      })
    } else {
      Linking.openURL(
        `mailto:${CONTACT_EMAIL_ADDRESS}?subject=${messageSubject}&body=${messageBody}`,
      )
    }
  }

  // TODO: extract in Instance
  const openTelegramAction = () => Linking.openURL(`https://t.me/blinkbtc`)

  const contactOptionList = [
    {
      name: LL.support.statusPage(),
      icon: () => (
        <Icon
          name={"alert-circle-outline"}
          type="ionicon"
          color={styles.listItemTitle.color}
        />
      ),
      action: () => {
        // TODO: extract in Instance
        Linking.openURL(`https://blink.statuspage.io/`)
      },
      hidden: !showStatusPage,
    },
    {
      name: LL.support.telegram(),
      icon: () => <TelegramOutline width={24} height={24} style={styles.icons} />,
      action: () => {
        openTelegramAction()
        toggleModal()
      },
    },
    {
      name: LL.support.whatsapp(),
      icon: () => <Icon name={"ios-logo-whatsapp"} type="ionicon" style={styles.icons} />,
      action: () => {
        openWhatsAppAction(messageBody)
        toggleModal()
      },
    },
    {
      name: LL.support.email(),
      icon: () => <Icon name={"mail-outline"} type="ionicon" style={styles.icons} />,
      action: () => {
        openEmailAction()
        toggleModal()
      },
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
          if (item.hidden) return null
          return (
            <ListItem
              key={i}
              bottomDivider
              onPress={item.action}
              containerStyle={styles.listItemContainer}
            >
              {item.icon()}
              <ListItem.Content>
                <ListItem.Title style={styles.listItemTitle}>{item.name}</ListItem.Title>
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

export const openWhatsAppAction = (message: string) => {
  openWhatsApp(WHATSAPP_CONTACT_NUMBER, message)
}
