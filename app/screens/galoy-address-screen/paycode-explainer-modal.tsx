import { useI18nContext } from "@app/i18n/i18n-react"
import { Text } from "@rneui/base"
import { makeStyles } from "@rneui/themed"
import React from "react"
import { Modal, TouchableWithoutFeedback, View } from "react-native"

const useStyles = makeStyles(({ colors }) => ({
  centeredView: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    marginTop: 22,
  },
  modalView: {
    marginTop: 120,
    margin: 20,
    backgroundColor: colors.whiteOrDarkGrey,
    borderRadius: 20,
    padding: 35,
    shadowColor: colors.grey1,
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 4,
    elevation: 5,
    width: "90%",
  },
  titleText: {
    color: colors.black,
    fontSize: 20,
    fontWeight: "bold",
  },
  bodyText: {
    color: colors.black,
    fontSize: 16,
    fontWeight: "400",
  },
  backText: {
    justifyContent: "center",
    alignItems: "center",
    marginTop: 16,
  },
  cancelText: {
    color: colors.primary,
    fontSize: 18,
  },
}))

type SetAddressModalProps = {
  modalVisible: boolean
  toggleModal: () => void
}

const wallets = ["Muun", "Chivo", "Strike"]

export const PayCodeExplainerModal = ({
  modalVisible,
  toggleModal,
}: SetAddressModalProps) => {
  const styles = useStyles()
  const { LL } = useI18nContext()

  return (
    <View style={styles.centeredView}>
      <Modal
        animationType="slide"
        transparent={true}
        visible={modalVisible}
        onRequestClose={toggleModal}
      >
        <View style={styles.modalView}>
          <Text style={styles.titleText}>
            {LL.GaloyAddressScreen.howToUseYourPaycode()}
          </Text>
          <Text style={styles.bodyText}>
            {LL.GaloyAddressScreen.howToUseYourPaycodeExplainer()}
          </Text>
          <Text style={styles.bodyText}>
            {wallets.map((wallet) => (
              <Text key={wallet} style={styles.bodyText}>
                {"\n"}
                {"\u2B24 "}
                {wallet}
              </Text>
            ))}
          </Text>
          <TouchableWithoutFeedback onPress={toggleModal}>
            <View style={styles.backText}>
              <Text style={styles.cancelText}>{LL.common.back()}</Text>
            </View>
          </TouchableWithoutFeedback>
        </View>
      </Modal>
    </View>
  )
}
