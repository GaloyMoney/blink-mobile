import React, { ReactNode } from "react"
import { Platform, View, ScrollView, TouchableOpacity } from "react-native"
import Modal from "react-native-modal"
import { makeStyles, Text, useTheme } from "@rneui/themed"
import { GaloyIcon } from "../atomic/galoy-icon"
import { GaloyPrimaryButton } from "../atomic/galoy-primary-button"
import { GaloySecondaryButton } from "../atomic/galoy-secondary-button"

export type CustomModalProps = {
  isVisible: boolean
  toggleModal: () => void
  image: ReactNode
  title: string
  body: ReactNode
  primaryButtonTitle: string
  primaryButtonOnPress: () => void
  primaryButtonLoading?: boolean
  primaryButtonDisabled?: boolean
  secondaryButtonTitle?: string
  secondaryButtonOnPress?: () => void
}

const CustomModal: React.FC<CustomModalProps> = ({
  isVisible,
  toggleModal,
  image,
  title,
  body,
  primaryButtonTitle,
  primaryButtonOnPress,
  primaryButtonLoading,
  primaryButtonDisabled,
  secondaryButtonTitle,
  secondaryButtonOnPress,
}) => {
  const styles = useStyles()
  const {
    theme: { mode, colors },
  } = useTheme()
  return (
    <Modal isVisible={isVisible} backdropOpacity={1} backdropColor={colors.primary4}>
      <View style={styles.container}>
        <TouchableOpacity style={styles.closeIcon} onPress={toggleModal}>
          <GaloyIcon name="close" size={30} color={colors.grey0} />
        </TouchableOpacity>
        <ScrollView
          style={styles.modalCard}
          indicatorStyle={mode === "dark" ? "white" : "black"}
        >
          <View style={styles.imageContainer}>{image}</View>
          <View style={styles.modalTitleContainer}>
            <Text style={styles.modalTitleText}>{title}</Text>
          </View>
          <View style={styles.modalBodyContainer}>{body}</View>
        </ScrollView>
        <View style={styles.modalActionsContainer}>
          <GaloyPrimaryButton
            title={primaryButtonTitle}
            onPress={primaryButtonOnPress}
            loading={primaryButtonLoading}
            disabled={primaryButtonDisabled}
          />
          {secondaryButtonTitle && secondaryButtonOnPress && (
            <GaloySecondaryButton
              title={secondaryButtonTitle}
              onPress={secondaryButtonOnPress}
            />
          )}
        </View>
      </View>
    </Modal>
  )
}

export default CustomModal

const useStyles = makeStyles(({ colors }) => ({
  container: {
    backgroundColor: colors.white,
    height: "75%",
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
    color: colors.grey2,
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
    color: colors.grey5,
    textAlign: "center",
    maxWidth: "80%",
  },
  modalActionsContainer: {
    width: "100%",
    height: "auto",
    flexDirection: "column",
    rowGap: 10,
    marginVertical: 20,
  },
  closeIcon: {
    width: "100%",
    marginBottom: 10,
    justifyContent: "flex-end",
    alignItems: "flex-end",
  },
}))
