import React from "react"

import Modal from "react-native-modal"
import { Text, makeStyles, useTheme } from "@rneui/themed"
import { Pressable, View } from "react-native"
import { SafeAreaView } from "react-native-safe-area-context"
import Icon from "react-native-vector-icons/Ionicons"
import { GaloySecondaryButton } from "../../components/atomic/galoy-secondary-button"
import { useI18nContext } from "@app/i18n/i18n-react"
import Rate from "react-native-rate"
import { ratingOptions } from "@app/config"
import crashlytics from "@react-native-firebase/crashlytics"
import { SuggestAnImprovement } from "./improvement-request"

export const FeebBackAfterPayment: React.FC<{ navigateHome: () => void }> = ({
  navigateHome,
}) => {
  const { LL } = useI18nContext()
  const styles = useStyles()
  const {
    theme: { colors },
  } = useTheme()
  const [IsActive, setIsActive] = React.useState(false)

  const dismiss = React.useCallback(() => {
    setIsActive(false)
    navigateHome()
  }, [setIsActive, navigateHome])

  const triggerNextModal = () => {
    setIsActive(false)
    return <SuggestAnImprovement navigateHome={navigateHome} />
  }

  const rateUs = () => {
    Rate.rate(ratingOptions, (success, errorMessage) => {
      if (success) {
        crashlytics().log("User went to the review page")
      }
      if (errorMessage) {
        crashlytics().recordError(new Error(errorMessage))
      }
    })
  }

  return (
    <Modal
      swipeDirection={["down"]}
      isVisible={IsActive}
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
          Enjoying the app?
        </Text>
        <View style={styles.buttonContainer}>
          <GaloySecondaryButton title={LL.common.No()} onPress={triggerNextModal} />
          <GaloySecondaryButton title={LL.common.yes()} onPress={rateUs} />
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

  buttonContainer: {
    display: "flex",
    justifyContent: "center",
  },

  icon: {
    height: 40,
    top: -40,
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
