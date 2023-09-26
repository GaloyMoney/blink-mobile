import React from "react"
import { Linking } from "react-native"
import ReactNativeModal from "react-native-modal"

import { CONTACT_EMAIL_ADDRESS, WHATSAPP_CONTACT_NUMBER } from "@app/config"
import { useI18nContext } from "@app/i18n/i18n-react"
import { openWhatsApp } from "@app/utils/external"
import { Icon, ListItem, makeStyles, useTheme } from "@rneui/themed"

import TelegramOutline from "./telegram.svg"

export const SupportChannels = {
  Email: "email",
  Telegram: "telegram",
  WhatsApp: "whatsapp",
  StatusPage: "statusPage",
  Mattermost: "mattermost",
  Faq: "faq",
} as const

export type SupportChannels = (typeof SupportChannels)[keyof typeof SupportChannels]

type Props = {
  isVisible: boolean
  toggleModal: () => void
  messageBody: string
  messageSubject: string
  supportChannels: SupportChannels[]
}

/*
A modal component that displays contact options at the bottom of the screen.
*/
const ContactModal: React.FC<Props> = ({
  isVisible,
  toggleModal,
  messageBody,
  messageSubject,
  supportChannels,
}) => {
  const { LL } = useI18nContext()
  const styles = useStyles()
  const {
    theme: { colors },
  } = useTheme()

  const contactOptionList = [
    {
      id: SupportChannels.StatusPage,
      name: LL.support.statusPage(),
      icon: <Icon name={"alert-circle-outline"} type="ionicon" />,
      action: () => {
        // TODO: extract in Instance
        Linking.openURL(`https://blink.statuspage.io/`)
      },
    },
    {
      id: SupportChannels.Faq,
      name: LL.support.faq(),
      icon: <Icon name={"book-outline"} type="ionicon" color={colors.black} />,
      action: () => {
        Linking.openURL(`https://faq.blink.sv`)
        toggleModal()
      },
    },
    {
      id: SupportChannels.Telegram,
      name: LL.support.telegram(),
      icon: <TelegramOutline width={24} height={24} fill={colors.black} />,
      action: () => {
        Linking.openURL(`https://t.me/blinkbtc`)
        toggleModal()
      },
    },
    {
      id: SupportChannels.Mattermost,
      name: LL.support.mattermost(),
      icon: <Icon name={"chatbubbles-outline"} type="ionicon" color={colors.black} />,
      action: () => {
        Linking.openURL(`https://chat.galoy.io`)
        toggleModal()
      },
    },
    {
      id: SupportChannels.WhatsApp,
      name: LL.support.whatsapp(),
      icon: <Icon name={"ios-logo-whatsapp"} type="ionicon" color={colors.black} />,
      action: () => {
        openWhatsAppAction(messageBody)
        toggleModal()
      },
    },
    {
      id: SupportChannels.Email,
      name: LL.support.email(),
      icon: <Icon name={"mail-outline"} type="ionicon" color={colors.black} />,
      action: () => {
        Linking.openURL(
          `mailto:${CONTACT_EMAIL_ADDRESS}?subject=${encodeURIComponent(
            messageSubject,
          )}&body=${encodeURIComponent(messageBody)}`,
        )
        toggleModal()
      },
    },
  ]

  return (
    <ReactNativeModal
      isVisible={isVisible}
      backdropOpacity={0.3}
      backdropColor={colors.grey3}
      onBackdropPress={toggleModal}
      style={styles.modal}
    >
      {contactOptionList
        .filter((item) => supportChannels.includes(item.id))
        .map((item) => {
          return (
            <ListItem
              key={item.name}
              bottomDivider
              onPress={item.action}
              containerStyle={styles.listItemContainer}
            >
              {item.icon}
              <ListItem.Content>
                <ListItem.Title style={styles.listItemTitle}>{item.name}</ListItem.Title>
              </ListItem.Content>
              <ListItem.Chevron name={"chevron-forward"} type="ionicon" />
            </ListItem>
          )
        })}
    </ReactNativeModal>
  )
}

export default ContactModal

export const openWhatsAppAction = (message: string) => {
  openWhatsApp(WHATSAPP_CONTACT_NUMBER, message)
}

const useStyles = makeStyles(({ colors }) => ({
  modal: {
    justifyContent: "flex-end",
    flexGrow: 1,
    marginHorizontal: 0,
  },
  listItemContainer: {
    backgroundColor: colors.white,
  },
  listItemTitle: {
    color: colors.black,
  },
  icons: {
    color: colors.black,
  },
}))
