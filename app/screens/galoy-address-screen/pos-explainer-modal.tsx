import React from "react"
import { Dimensions, Modal, View, TouchableWithoutFeedback } from "react-native"
import { TouchableOpacity } from "react-native-gesture-handler"

import { GaloyIcon } from "@app/components/atomic/galoy-icon"
import { useI18nContext } from "@app/i18n/i18n-react"
import { makeStyles, Text, useTheme } from "@rneui/themed"
import { useAppConfig } from "@app/hooks"

const screenHeight = Dimensions.get("window").height

const useStyles = makeStyles(({ colors }) => ({
  modalContainer: {
    flex: 1,
    justifyContent: "flex-end",
    backgroundColor: colors.backgroundPrimary10,
  },
  modalView: {
    maxHeight: screenHeight * 0.5,
    paddingHorizontal: 20,
    paddingVertical: 30,
    paddingBottom: 40,
    backgroundColor: colors.white,
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    width: "100%",
  },
  titleContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 16,
  },
  titleText: {
    color: colors.grey1,
    fontSize: 20,
    lineHeight: 24,
  },
  bodyText: {
    color: colors.grey1,
    fontSize: 18,
    fontWeight: "400",
  },
}))

type SetAddressModalProps = {
  modalVisible: boolean
  toggleModal: () => void
}

export const PosExplainerModal = ({
  modalVisible,
  toggleModal,
}: SetAddressModalProps) => {
  const { LL } = useI18nContext()
  const theme = useTheme()
  const styles = useStyles(theme)
  const { appConfig } = useAppConfig()
  const { name: bankName } = appConfig.galoyInstance

  return (
    <Modal
      animationType="slide"
      transparent={true}
      visible={modalVisible}
      onRequestClose={toggleModal}
    >
      <TouchableWithoutFeedback onPress={toggleModal}>
        <View style={styles.modalContainer}>
          <View style={styles.modalView}>
            <View style={styles.titleContainer}>
              <Text type="h2" bold style={styles.titleText}>
                {LL.GaloyAddressScreen.howToUseYourCashRegister()}
              </Text>
              <TouchableOpacity onPress={toggleModal}>
                <GaloyIcon name="close" size={24} color={styles.titleText.color} />
              </TouchableOpacity>
            </View>
            <Text style={styles.bodyText}>
              {LL.GaloyAddressScreen.howToUseYourCashRegisterExplainer({ bankName })}
            </Text>
          </View>
        </View>
      </TouchableWithoutFeedback>
    </Modal>
  )
}
