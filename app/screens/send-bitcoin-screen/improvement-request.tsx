import * as React from "react"
import Modal from "react-native-modal"
import { Text, makeStyles, useTheme } from "@rneui/themed"
import { Pressable, View, TextInput } from "react-native"
import { SafeAreaView } from "react-native-safe-area-context"
import Icon from "react-native-vector-icons/Ionicons"
import { useI18nContext } from "@app/i18n/i18n-react"
import { GaloySecondaryButton } from "@app/components/atomic/galoy-secondary-button"
import AsyncStorage from "@react-native-async-storage/async-storage"

export const SuggestAnImprovement: React.FC<{ navigateHome: () => void }> = ({
  navigateHome,
}) => {
  const { LL } = useI18nContext()
  const styles = useStyles()
  const {
    theme: { colors },
  } = useTheme()
  const [isActive, setIsActive] = React.useState(false)
  const [token, setToken] = React.useState("")
  const [improvement, setImprovement] = React.useState("")

  const dismiss = React.useCallback(() => {
    setIsActive(false)
    navigateHome()
  }, [setIsActive, navigateHome])

  const submitImprovement = async () => {
    const savedToken = await AsyncStorage.getItem("mattermostToken")
    if (savedToken === "") {
      const response = await fetch("https://chat.galoy.io/api/v4/users/login", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          // eslint-disable-next-line camelcase
          login_id: "username",
          password: "password",
        }),
      })

      if (response.ok) {
        const newToken = response.headers.get("Token")
        setToken(newToken ?? "")
        await AsyncStorage.setItem("mattermostToken", newToken ?? "")
      }
    } else {
      setToken(savedToken ?? "")
    }

    await fetch("https://chat.galoy.io/api/v4/posts", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${token}`,
      },
      body: JSON.stringify({
        // eslint-disable-next-line camelcase
        channel_id: "n59hg9abetdrtygof11kncjbdw",
        message: improvement,
      }),
    }).then(() => {
      setIsActive(false)
    })
  }

  return (
    <Modal
      swipeDirection={["down"]}
      isVisible={isActive}
      onSwipeComplete={dismiss}
      onBackdropPress={dismiss}
      backdropOpacity={0.3}
      backdropColor={colors.grey3}
      swipeThreshold={50}
      propagateSwipe
      style={styles.modal}
    >
      <Pressable style={styles.flex} onPress={dismiss}></Pressable>
      <SafeAreaView style={styles.modalForeground}>
        <View style={styles.iconContainer}>
          <Icon name="ios-remove" size={72} color={colors.grey3} style={styles.icon} />
        </View>
        <Text type="h1" bold style={styles.message}>
          Thankyou for the feedback, would you like to like to suggest and improvement?
        </Text>
        <View>
          <TextInput
            style={styles.noteInput}
            placeholder={LL.SendBitcoinScreen.note()}
            onChangeText={(improvement) => setImprovement(improvement)}
            value={improvement}
            multiline={true}
            numberOfLines={3}
            autoFocus
          />
          <GaloySecondaryButton title={LL.common.submit()} onPress={submitImprovement} />
        </View>
      </SafeAreaView>
    </Modal>
  )
}

const useStyles = makeStyles(({ colors }) => ({
  flex: {
    maxHeight: "25%",
    flex: 1,
  },

  icon: {
    height: 40,
    top: -40,
  },

  noteInput: {
    color: colors.black,
  },

  iconContainer: {
    height: 14,
  },

  message: {
    marginVertical: 8,
  },

  modal: {
    margin: 0,
    flex: 3,
  },

  modalForeground: {
    alignItems: "center",
    paddingHorizontal: 20,
    paddingTop: 10,
    flex: 1,
    backgroundColor: colors.white,
  },

  modalContent: {
    backgroundColor: "white",
  },
}))
