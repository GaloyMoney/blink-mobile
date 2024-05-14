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
  Chatbot: "chatbot",
} as const

export type SupportChannelsToHide = (typeof SupportChannels)[keyof typeof SupportChannels]

type Props = {
  isVisible: boolean
  toggleModal: () => void
  messageBody: string
  messageSubject: string
  supportChannelsToHide?: SupportChannelsToHide[]
}

/*
A modal component that displays contact options at the bottom of the screen.
*/
const ContactModal: React.FC<Props> = ({
  isVisible,
  toggleModal,
  messageBody,
  messageSubject,
  supportChannelsToHide,
}) => {
  const { LL } = useI18nContext()
  const styles = useStyles()
  const {
    theme: { colors },
  } = useTheme()

  const openEmailAction = () => {
    Linking.openURL(
      `mailto:${CONTACT_EMAIL_ADDRESS}?subject=${encodeURIComponent(
        messageSubject,
      )}&body=${encodeURIComponent(messageBody)}`,
    )
  }

  // TODO: extract in Instance
  const openTelegramAction = () => Linking.openURL(`https://t.me/+TsqkMBTyU9o0ZTlh`)

  const openMattermostAction = () => Linking.openURL(`https://chat.galoy.io`)

  const contactOptionList = [
    {
      name: LL.support.statusPage(),
      icon: <Icon name={"alert-circle-outline"} type="ionicon" />,
      action: () => {
        // TODO: extract in Instance
        Linking.openURL(`https://blink.statuspage.io/`)
      },
      hidden: supportChannelsToHide?.includes(SupportChannels.StatusPage),
    },
    {
      name: LL.support.telegram(),
      icon: <TelegramOutline width={24} height={24} fill={colors.black} />,
      action: () => {
        openTelegramAction()
        toggleModal()
      },
      hidden: supportChannelsToHide?.includes(SupportChannels.Telegram),
    },
    {
      name: LL.support.mattermost(),
      icon: <Icon name={"chatbubbles-outline"} type="ionicon" color={colors.black} />,
      action: () => {
        openMattermostAction()
        toggleModal()
      },
      hidden: supportChannelsToHide?.includes(SupportChannels.Mattermost),
    },
    {
      name: LL.support.whatsapp(),
      icon: <Icon name={"logo-whatsapp"} type="ionicon" color={colors.black} />,
      action: () => {
        openWhatsAppAction(messageBody)
        toggleModal()
      },
      hidden: supportChannelsToHide?.includes(SupportChannels.WhatsApp),
    },
    {
      name: LL.support.email(),
      icon: <Icon name={"mail-outline"} type="ionicon" color={colors.black} />,
      action: () => {
        openEmailAction()
        toggleModal()
      },
      hidden: supportChannelsToHide?.includes(SupportChannels.Email),
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
      {contactOptionList.map((item) => {
        if (item.hidden) return null
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
