import { useI18nContext } from "@app/i18n/i18n-react"
import React from "react"
import { Dimensions, Modal, View } from "react-native"
import { makeStyles, useTheme, Text } from "@rneui/themed"
import { TouchableOpacity } from "react-native-gesture-handler"
import { GaloyIcon } from "@app/components/atomic/galoy-icon"

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
    color: colors.grey5,
    fontSize: 20,
    lineHeight: 24,
  },
  bodyText: {
    color: colors.grey5,
    fontSize: 18,
    fontWeight: "400",
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
  const theme = useTheme()
  const styles = useStyles(theme)

  return (
    <Modal
      animationType="slide"
      transparent={true}
      visible={modalVisible}
      onRequestClose={toggleModal}
    >
      <View style={styles.modalContainer}>
        <View style={styles.modalView}>
          <View style={styles.titleContainer}>
            <Text type="h2" bold style={styles.titleText}>
              {LL.GaloyAddressScreen.howToUseYourPaycode()}
            </Text>
            <TouchableOpacity onPress={toggleModal}>
              <GaloyIcon name="close" size={24} color="black" />
            </TouchableOpacity>
          </View>
          <Text style={styles.bodyText}>
            {LL.GaloyAddressScreen.howToUseYourPaycodeExplainer()}
          </Text>
          <Text style={styles.bodyText}>
            {wallets.map((wallet) => (
              <Text key={wallet} style={styles.bodyText}>
                {"\n"}
                {"\u2022"}
                {wallet}
              </Text>
            ))}
          </Text>
        </View>
      </View>
    </Modal>
  )
}
