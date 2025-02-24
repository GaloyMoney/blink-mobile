import * as React from "react"
import { View } from "react-native"
import Modal from "react-native-modal"
import { makeStyles, useTheme, Text } from "@rneui/themed"

// components
import { GaloyPrimaryButton } from "../atomic/galoy-primary-button"
import { GaloySecondaryButton } from "../atomic/galoy-secondary-button"

// assets
import CryptoWallet from "@app/assets/icons/cryptoWallet.svg"

type Props = {
  isVisible: boolean
  onSave: () => void
  onCancel: () => void
}

const SaveCardModal: React.FC<Props> = ({ isVisible, onSave, onCancel }) => {
  const styles = useStyles()
  const { colors } = useTheme().theme

  return (
    <Modal
      isVisible={isVisible}
      backdropOpacity={0.3}
      backdropColor={colors.grey3}
      onBackdropPress={onCancel}
    >
      <View style={styles.modalCard}>
        <CryptoWallet width={"100%"} height={150} />
        <Text style={styles.cardTitle} type={"h2"}>
          Would you like to save your flash card?
        </Text>
        <View style={{ width: "100%" }}>
          <GaloyPrimaryButton
            title={"Save"}
            onPress={onSave}
            style={{ marginBottom: 10 }}
          />
          <GaloySecondaryButton title={"Cancel"} onPress={onCancel} />
        </View>
      </View>
    </Modal>
  )
}

export default SaveCardModal

const useStyles = makeStyles(({ colors }) => ({
  modalCard: {
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: colors.white,
    borderRadius: 16,
    padding: 20,
  },
  cardTitle: {
    textAlign: "center",
    marginHorizontal: 20,
    marginVertical: 20,
  },
}))
