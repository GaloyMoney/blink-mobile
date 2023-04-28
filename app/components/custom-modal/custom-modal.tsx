import { ReactNode } from "react"
import { Image, ImageSourcePropType, Platform, View } from "react-native"
import { ScrollView, TouchableOpacity } from "react-native-gesture-handler"
import Modal from "react-native-modal"

import { makeStyles, Text, useTheme } from "@rneui/themed"

import { GaloyIcon } from "../atomic/galoy-icon"
import { GaloyPrimaryButton } from "../atomic/galoy-primary-button"
import { GaloySecondaryButton } from "../atomic/galoy-secondary-button"

type ModalProps = {
  isVisible: boolean
  toggleModal: () => void
  imageSource: ImageSourcePropType
  title: string
  body: ReactNode
  primaryButtonTitle: string
  primaryButtonOnPress: () => void
  secondaryButtonTitle?: string
  secondaryButtonOnPress?: () => void
}

const CustomModal: React.FC<ModalProps> = ({
  isVisible,
  toggleModal,
  imageSource,
  title,
  body,
  primaryButtonTitle,
  primaryButtonOnPress,
  secondaryButtonTitle,
  secondaryButtonOnPress,
}) => {
  const styles = useStyles()
  const {
    theme: { mode, colors },
  } = useTheme()
  return (
    <Modal isVisible={isVisible} backdropOpacity={1} backdropColor={colors.primary9}>
      <View style={styles.container}>
        <ScrollView
          style={styles.modalCard}
          indicatorStyle={mode === "dark" ? "white" : "black"}
        >
          <TouchableOpacity style={styles.closeIcon} onPress={toggleModal}>
            <GaloyIcon name="close" size={30} color={colors.grey1} />
          </TouchableOpacity>
          <View style={styles.imageContainer}>
            <Image source={imageSource} style={styles.image} resizeMode="contain" />
          </View>
          <View style={styles.modalTitleContainer}>
            <Text style={styles.modalTitleText}>{title}</Text>
          </View>
          <View style={styles.modalBodyContainer}>{body}</View>
        </ScrollView>
        <View style={styles.modalActionsContainer}>
          <GaloyPrimaryButton
            title={primaryButtonTitle}
            onPress={primaryButtonOnPress}
            titleStyle={styles.buttonTitle}
          />
          {secondaryButtonTitle && secondaryButtonOnPress && (
            <GaloySecondaryButton
              title={secondaryButtonTitle}
              onPress={secondaryButtonOnPress}
              titleStyle={styles.buttonTitle}
            />
          )}
        </View>
      </View>
    </Modal>
  )
}

export default CustomModal

const useStyles = makeStyles((theme) => ({
  container: {
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: theme.colors.whiteOrDarkGrey,
    maxHeight: "75%",
    borderRadius: 16,
    padding: 20,
  },
  modalCard: {
    width: "100%",
  },
  imageContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 40,
  },
  image: {
    width: 100,
    height: 100,
  },
  modalTitleContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 10,
  },
  modalTitleText: {
    fontSize: 24,
    fontWeight: Platform.OS === "ios" ? "600" : "700",
    lineHeight: 32,
    maxWidth: "80%",
    textAlign: "center",
    color: theme.colors.grey5,
    marginBottom: 10,
  },
  modalBodyContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 30,
  },
  modalBodyText: {
    fontSize: 20,
    fontWeight: "400",
    lineHeight: 24,
    color: theme.colors.grey5,
    textAlign: "center",
    maxWidth: "80%",
  },
  modalActionsContainer: {
    backgroundColor: theme.colors.white,
    width: "100%",
    height: "auto",
    flexDirection: "column",
    rowGap: 10,
    marginVertical: 20,
  },
  closeIcon: {
    flex: 1,
    justifyContent: "flex-end",
    alignItems: "flex-end",
    paddingRight: 10,
  },
  buttonTitle: {
    fontSize: 20,
    lineHeight: 24,
    fontWeight: "600",
  },
}))
