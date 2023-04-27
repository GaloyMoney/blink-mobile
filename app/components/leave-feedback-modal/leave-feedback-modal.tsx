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

  const rateUsMessage = LL.SettingsScreen.rateUs({
    storeName: isIos ? "App Store" : "Play Store",
  })
  const starUsMessage = LL.SettingsScreen.starUs()
  const suggestImprovementMessage = LL.SettingsScreen.suggestImprovement()

  const leaveFeedbackWays = [
    {
      name: rateUsMessage,
      icon: "star",
      action: () => {},
    },
    {
      name: starUsMessage,
      icon: "md-logo-github",
      action: () => {},
    },
    {
      name: suggestImprovementMessage,
      icon: "flag",
      action: () => {},
    }
  ]

  return (
    <ReactNativeModal
      isVisible={isVisible}
      onBackdropPress={toggleModal}
      style={styles.modal}
    >
      <View style={styles.content}>
        {leaveFeedbackWays.map((item, i) => {
          return (
            <ListItem key={i} bottomDivider onPress={item.action}>
              <Icon name={item.icon} type="ionicon" />
              <ListItem.Content>
                <ListItem.Title>{item.name}</ListItem.Title>
              </ListItem.Content>
            </ListItem>
          )
        })}
      </View>
    </ReactNativeModal>
  )
}

export default LeaveFeedbackModal
