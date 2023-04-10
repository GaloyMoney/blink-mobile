import { useAppConfig } from "@app/hooks"
import { useI18nContext } from "@app/i18n/i18n-react"
import { palette } from "@app/theme"
import { Text } from "@rneui/base"
import React from "react"
import { Modal, StyleSheet, TouchableWithoutFeedback, View } from "react-native"

const wallets = [
  "Bitcoin Beach Wallet",
  "Blue Wallet",
  "Breez",
  "Phoenix",
  "Simple Bitcoin Wallet (SBW)",
  "Wallet of Satoshi",
]

const styles = StyleSheet.create({
  centeredView: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    marginTop: 22,
  },
  modalView: {
    marginTop: 120,
    marginHorizontal: 20,
    backgroundColor: palette.white,
    borderRadius: 20,
    padding: 35,
    shadowColor: palette.midGrey,
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
    color: palette.lapisLazuli,
    fontSize: 20,
    fontWeight: "bold",
  },
  bodyText: {
    color: palette.lapisLazuli,
    fontSize: 16,
    fontWeight: "400",
  },
  backText: {
    justifyContent: "center",
    alignItems: "center",
    marginTop: 16,
  },
  cancelText: {
    color: palette.primaryButtonColor,
    fontSize: 18,
  },
})

type SetAddressModalProps = {
  modalVisible: boolean
  toggleModal?: () => void
}

export const AddressExplainerModal = ({
  modalVisible,
  toggleModal,
}: SetAddressModalProps) => {
  const { appConfig } = useAppConfig()
  const { name: bankName } = appConfig.galoyInstance

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
            {LL.GaloyAddressScreen.howToUseYourAddress({ bankName })}
          </Text>
          <Text style={styles.bodyText}>
            {LL.GaloyAddressScreen.howToUseYourAddressExplainer({ bankName })}
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
