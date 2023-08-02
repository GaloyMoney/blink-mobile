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
  image?: ReactNode
  title: string
  body: ReactNode
  primaryButtonTitle: string
  primaryButtonTextAbove?: string
  nonScrollingContent?: ReactNode
  primaryButtonOnPress: () => void
  primaryButtonLoading?: boolean
  primaryButtonDisabled?: boolean
  secondaryButtonTitle?: string
  secondaryButtonOnPress?: () => void
  showCloseIconButton?: boolean
  minHeight?: string
  titleMaxWidth?: string
  titleTextAlignment?: "auto" | "center" | "left" | "right" | "justify"
}

const CustomModal: React.FC<CustomModalProps> = ({
  isVisible,
  toggleModal,
  image,
  title,
  body,
  minHeight,
  titleMaxWidth,
  titleTextAlignment,
  primaryButtonTitle,
  nonScrollingContent,
  primaryButtonOnPress,
  primaryButtonTextAbove,
  primaryButtonLoading,
  primaryButtonDisabled,
  secondaryButtonTitle,
  secondaryButtonOnPress,
  showCloseIconButton = true,
}) => {
  const styles = useStyles({
    hasPrimaryButtonTextAbove: Boolean(primaryButtonTextAbove),
    minHeight,
    titleMaxWidth,
    titleTextAlignment,
  })
  const {
    theme: { mode, colors },
  } = useTheme()
  return (
    <Modal
      isVisible={isVisible}
      backdropOpacity={0.7}
      backdropColor={colors.grey3}
      backdropTransitionOutTiming={0}
      avoidKeyboard={true}
    >
      <View style={styles.container}>
        {showCloseIconButton && (
          <TouchableOpacity style={styles.closeIcon} onPress={toggleModal}>
            <GaloyIcon name="close" size={30} color={colors.grey0} />
          </TouchableOpacity>
        )}
        <ScrollView
          style={styles.modalCard}
          persistentScrollbar={true}
          indicatorStyle={mode === "dark" ? "white" : "black"}
          bounces={false}
          contentContainerStyle={styles.scrollViewContainer}
        >
          {image && <View style={styles.imageContainer}>{image}</View>}
          <View style={styles.modalTitleContainer}>
            <Text style={styles.modalTitleText}>{title}</Text>
          </View>
          <View style={styles.modalBodyContainer}>{body}</View>
        </ScrollView>
        {nonScrollingContent}
        <View style={styles.modalActionsContainer}>
          <View>
            {primaryButtonTextAbove && (
              <Text style={styles.primaryButtonTextAbove} type="p3">
                {primaryButtonTextAbove}
              </Text>
            )}
            <GaloyPrimaryButton
              title={primaryButtonTitle}
              onPress={primaryButtonOnPress}
              loading={primaryButtonLoading}
              disabled={primaryButtonDisabled}
            />
          </View>
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

type UseStylesProps = {
  hasPrimaryButtonTextAbove: boolean
  minHeight?: string
  titleTextAlignment?: "auto" | "center" | "left" | "right" | "justify"
  titleMaxWidth?: string
}

const useStyles = makeStyles(({ colors }, props: UseStylesProps) => ({
  container: {
    backgroundColor: colors.white,
    maxHeight: "80%",
    minHeight: props.minHeight || "auto",
    borderRadius: 16,
    padding: 20,
  },
  modalCard: {
    width: "100%",
  },
  imageContainer: {
    justifyContent: "center",
    alignItems: "center",
    paddingBottom: 20,
  },
  modalTitleContainer: {
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 10,
  },
  modalTitleText: {
    fontSize: 24,
    fontWeight: Platform.OS === "ios" ? "600" : "700",
    lineHeight: 32,
    maxWidth: props.titleMaxWidth || "80%",
    textAlign: props.titleTextAlignment || "center",
    color: colors.black,
    marginBottom: 10,
  },
  modalBodyContainer: {
    flex: 1,
    flexGrow: 1,
  },
  scrollViewContainer: { flexGrow: 1 },
  modalBodyText: {
    fontSize: 20,
    fontWeight: "400",
    lineHeight: 24,
    textAlign: "center",
    maxWidth: "80%",
  },
  primaryButtonTextAbove: {
    textAlign: "center",
    paddingVertical: 8,
  },
  modalActionsContainer: {
    width: "100%",
    height: "auto",
    flexDirection: "column",
    rowGap: 12,
    marginTop: props.hasPrimaryButtonTextAbove ? 0 : 20,
  },
  closeIcon: {
    width: "100%",
    justifyContent: "flex-end",
    alignItems: "flex-end",
  },
}))
