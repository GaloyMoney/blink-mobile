import { useI18nContext } from "@app/i18n/i18n-react"
import { palette } from "@app/theme"
import React from "react"
import { Button, Modal, Text, View } from "react-native"
import EStyleSheet from "react-native-extended-stylesheet"

const styles = EStyleSheet.create({
  centeredView: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    marginTop: 22,
  },
  modalView: {
    flex: 1,
    margin: 20,
    backgroundColor: palette.white,
    borderRadius: 20,
    padding: 35,
    alignItems: "center",
    shadowColor: palette.midGrey,
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 4,
    elevation: 5,
  },
  modalText: {
    marginBottom: 15,
    textAlign: "center",
  },
  //   buttonStyle: {
  //     backgroundColor: palette.primaryButtonColor,
  //     color: palette.white,
  //   },
})

type SetAddressModalProps = {
  modalVisible: boolean
  toggleModal?: () => void
}

export const SetAddressModal = ({ modalVisible, toggleModal }: SetAddressModalProps) => {
  const { LL } = useI18nContext()
  return (
    <View style={styles.centeredView}>
      <Modal
        animationType="slide"
        transparent={true}
        visible={modalVisible}
        onRequestClose={() => {
          toggleModal()
        }}
      >
        <View style={styles.centeredView}>
          <View style={styles.modalView}>
            <Text style={styles.modalText}>Hello World!</Text>
            <Button title={LL.AddressScreen.buttonTitle({ bankName: "BBW" })} />
          </View>
        </View>
      </Modal>
    </View>
  )
}
