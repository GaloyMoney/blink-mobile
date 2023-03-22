import { palette } from "@app/theme"
import React from "react"
import { Linking, View } from "react-native"
import EStyleSheet from "react-native-extended-stylesheet"
import ReactNativeModal from "react-native-modal"
import { ListItem, Icon } from "@rneui/base"
import { useI18nContext } from "@app/i18n/i18n-react"
import { GITHUB_ISSUE_TICKET } from "@app/config"

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

type ContactModalProps = {
  isVisible: boolean
  toggleModal: () => void
}

/*
A modal component that displays contact options at the bottom of the screen.
*/
const TicketModal: React.FC<ContactModalProps> = ({ isVisible, toggleModal }) => {
  const { LL } = useI18nContext()
  //   const message = LL.support.defaultSupportMessage({
  //     os: isIos ? "iOS" : "Android",
  //     version: getReadableVersion(),
  //   })

  const openGithubUrl = () => {
    // if (isIos) {
    //   Clipboard.setString(CONTACT_EMAIL_ADDRESS)
    //   toastShow({
    //     message: LL.support.emailCopied({ email: CONTACT_EMAIL_ADDRESS }),
    //     type: "success",
    //   })
    // } else {
    Linking.openURL(GITHUB_ISSUE_TICKET).catch((err) =>
      console.error("Couldn't load page", err),
    )

    // }
    toggleModal()
  }

  const githubTicket = [
    {
      name: LL.support.github(),
      icon: "ios-logo-github",
      action: openGithubUrl,
    },
  ]
  return (
    <ReactNativeModal
      isVisible={isVisible}
      onBackdropPress={toggleModal}
      style={styles.modal}
    >
      <View style={styles.content}>
        {githubTicket.map((item, i) => {
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

export default TicketModal
